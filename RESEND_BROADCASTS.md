# Resend Broadcasts Integration

This document explains how to use Resend Broadcasts as a lightweight newsletter tool in your application.

## Overview

You can now send email broadcasts (newsletters) to segments of people using Resend's Broadcasts API. This provides a professional newsletter solution without needing a separate tool like Mailchimp.

## Architecture

### Database Tables

**`lists`** - Your segments/groups of people
- Stores list name and description
- Links to Resend segment via `resend_segment_id`
- Example: "Basketball Parents", "All Athletes", "Newsletter Subscribers"

**`list_people`** - Join table connecting people to lists
- Many-to-many relationship
- Tracks `resend_contact_id` for sync status

**`broadcasts`** - Your newsletter campaigns
- Tracks draft and sent broadcasts
- Stores stats (recipients, sent, delivered, opened, clicked)
- Links to Resend via `resend_broadcast_id`

**`emails`** - Individual email records
- Now has `broadcast_id` to link broadcast emails
- Existing one-off emails remain unchanged

## Workflow

### 1. Create a List (Segment)

```typescript
// In your UI, create a list
const { data: list } = await supabase
  .from("lists")
  .insert({
    account_id: account.id,
    name: "Basketball Parents",
    description: "Parents of all basketball team members"
  })
  .select()
  .single()
```

### 2. Add People to the List

```typescript
// Add people to the list
const { data } = await supabase
  .from("list_people")
  .insert([
    { list_id: list.id, person_id: person1.id },
    { list_id: list.id, person_id: person2.id },
  ])
```

### 3. Sync List to Resend

```typescript
// API call to sync list and people to Resend
const response = await fetch("/api/lists/sync-to-resend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ listId: list.id })
})

// This will:
// 1. Create a Resend segment (if not exists)
// 2. Sync all people to Resend as contacts
// 3. Add contacts to the segment
// 4. Store resend_segment_id and resend_contact_id for tracking
```

### 4. Create and Send a Broadcast

```typescript
const response = await fetch("/api/broadcasts/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    list_id: list.id,
    name: "Weekly Newsletter - Nov 5",
    subject: "Important Updates from Coach",
    content: "<h1>Hi {{FIRST_NAME}}</h1><p>Here are this week's updates...</p>",
    sender: "Coach Smith <coach@example.com>",
    sendNow: true  // or false to save as draft
  })
})
```

## Resend Features You Get

### ✅ Personalization

Use contact properties in your emails:
```html
<p>Hi {{FIRST_NAME}},</p>
<p>Your athlete {{ATHLETE_NAME}} has an upcoming game.</p>
```

### ✅ Unsubscribe Links

Resend automatically handles unsubscribe:
```html
<p>You can unsubscribe <a href="{{RESEND_UNSUBSCRIBE_URL}}">here</a></p>
```

### ✅ Analytics

Track opens, clicks, bounces, and more through Resend's dashboard.

### ✅ Deliverability

Resend handles SPF, DKIM, and DMARC for you.

## API Routes Created

### `/api/lists/sync-to-resend`
- **Method:** POST
- **Body:** `{ listId: string }`
- **Purpose:** Syncs a list and its people to Resend
- **Returns:** Sync status and counts

### `/api/broadcasts/create`
- **Method:** POST
- **Body:** 
  ```typescript
  {
    list_id: string
    name: string
    subject: string
    content: string // HTML
    sender: string
    sendNow: boolean
  }
  ```
- **Purpose:** Creates and optionally sends a broadcast
- **Returns:** Broadcast ID and Resend broadcast ID

## Utility Functions (`lib/resend-broadcasts.ts`)

### `syncPersonToResend(person)`
Syncs a single person to Resend as a contact

### `createResendSegment(name, description)`
Creates a new segment in Resend

### `addContactToSegment(contactId, segmentId)`
Adds a contact to a segment

### `createBroadcast(options)`
Creates a broadcast (doesn't send)

### `sendBroadcast(broadcastId)`
Sends an existing broadcast

### `getBroadcast(broadcastId)`
Gets broadcast details and stats

### `syncAccountPeopleToResend(accountId)`
Bulk sync all people from an account

## Migration

Run the migration to set up the database:

```bash
# If using Supabase CLI
supabase migration up

# Or apply directly
supabase db push
```

The migration:
- Creates `lists`, `list_people`, and `broadcasts` tables
- Adds `broadcast_id` to `emails` table
- Sets up proper RLS policies
- Creates necessary indexes

## Use Cases

### 1. Team Newsletters
- Create a list per team
- Send weekly updates to team members and parents
- Track who opens and clicks

### 2. Account-Wide Announcements
- Create an "All Families" list
- Send important announcements
- Ensure high deliverability

### 3. Segmented Communication
- "Basketball Parents"
- "Soccer Parents"  
- "All Coaches"
- "Unpaid Invoices" (dynamic segment)

### 4. Drip Campaigns
- Welcome series for new families
- Payment reminders
- End-of-season surveys

## Best Practices

### 1. Keep Lists Synced
Re-sync your list when you add new people:
```typescript
// After adding people to a list
await fetch("/api/lists/sync-to-resend", {
  method: "POST",
  body: JSON.stringify({ listId: list.id })
})
```

### 2. Use Drafts for Review
Set `sendNow: false` to create drafts, review in Resend dashboard, then send.

### 3. Personalize Content
Use `{{FIRST_NAME}}`, `{{LAST_NAME}}`, etc. for better engagement.

### 4. Always Include Unsubscribe
```html
<p><a href="{{RESEND_UNSUBSCRIBE_URL}}">Unsubscribe</a></p>
```

### 5. Track Performance
Check Resend dashboard for:
- Open rates
- Click rates
- Bounce rates
- Unsubscribe rates

## Differences: One-Off Emails vs Broadcasts

| Feature | One-Off Emails | Broadcasts |
|---------|---------------|------------|
| Recipients | Individual people | Entire segments |
| Use Case | Transactional | Marketing/Newsletter |
| Personalization | Basic | Advanced (contact properties) |
| Unsubscribe | Manual | Automatic |
| Analytics | Basic | Full dashboard |
| Volume | Low | High |
| Example | Invoice reminder | Weekly newsletter |

## Next Steps

1. **Build Lists UI** - Create pages to manage lists and add people
2. **Build Broadcasts UI** - Create/send/schedule broadcasts
3. **Add Analytics** - Display broadcast stats in your app
4. **Webhooks** - Listen to Resend webhooks for real-time updates
5. **Templates** - Create reusable email templates

## Environment Variables

Make sure you have:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

## Resources

- [Resend Broadcasts Docs](https://resend.com/docs/api-reference/broadcasts/create-broadcast)
- [Resend Segments Docs](https://resend.com/docs/api-reference/segments)
- [Resend Contacts Docs](https://resend.com/docs/api-reference/contacts)
- [Resend Dashboard](https://resend.com/broadcasts)

