# Email System Improvement Plan

## Executive Summary

Your email system currently has **4 different sending methods, 3 different UIs, and inconsistent tracking**. This plan unifies everything into a cohesive system that fully leverages Resend's capabilities.

---

## Current Problems

### 1. **Inefficient Sending**
- **Problem**: `/api/send-emails` loops through recipients with 100ms delays
- **Impact**: Slow, potential timeouts, rate limiting issues
- **Solution**: Use Resend's `batch.send()` API (up to 100 emails per call)

### 2. **Inconsistent Database Logging**
- **Problem**: Invite emails don't log, broadcast individual recipients not tracked
- **Impact**: Incomplete email history, can't track delivery per person
- **Solution**: All emails log to `emails` table with appropriate `broadcast_id`

### 3. **Multiple Email APIs**
```
/api/send-emails       → One-off & team emails
/api/broadcasts/create → Newsletter broadcasts  
/api/invoices/resend   → Invoice emails
/api/invite-person     → Invite emails
```
- **Problem**: Duplicated code, inconsistent error handling
- **Solution**: Unified `/api/email/send` with type parameter

### 4. **Incomplete Resend Integration**
- ❌ Not syncing people to Resend contacts
- ❌ Not using batch sending
- ❌ Not using Resend audience management
- ✅ Using broadcasts (good!)
- ❌ Not tracking opens/clicks per broadcast recipient

### 5. **Webhook Gaps**
- `/api/email-webhook` only updates `emails` table
- Doesn't handle broadcast email events
- Doesn't update `broadcasts` aggregate stats

### 6. **UI Inconsistency**
- Teams → `SendEmailSheet` ✅
- Lists → Different UI
- Broadcasts → Different UI  
- No unified composer

---

## Proposed Solution

### Phase 1: Unified Email API (High Priority)

#### Create `/api/email/send` endpoint

**Benefits:**
- Single source of truth
- Consistent error handling
- Unified logging
- Support all email types

**Request Format:**
```typescript
{
  type: 'one-off' | 'batch' | 'broadcast' | 'transactional',
  sender: string,
  recipients: Array<{ email: string, person_id?: string }>,
  subject: string,
  content: string,
  preview?: string,
  template?: 'basic' | 'invoice' | 'invite',
  metadata?: {
    broadcast_id?: string,
    invoice_id?: string,
    team_id?: string
  },
  scheduled_at?: string // For future scheduling
}
```

**Implementation:**
- Use Resend `batch.send()` for multiple recipients
- Log ALL emails to `emails` table
- Link to broadcasts, invoices, etc. via foreign keys
- Return tracking IDs

---

### Phase 2: Resend Contact Sync (High Priority)

#### Auto-sync people to Resend contacts

**Create Database Trigger:**
```sql
-- Auto-sync when person created/updated
CREATE OR REPLACE FUNCTION sync_person_to_resend()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to sync to Resend
  PERFORM net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/api/resend/sync-contact',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'person_id', NEW.id,
      'email', NEW.email,
      'first_name', NEW.first_name,
      'last_name', NEW.last_name
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER person_resend_sync
AFTER INSERT OR UPDATE OF email, first_name, last_name
ON people
FOR EACH ROW
WHEN (NEW.email IS NOT NULL)
EXECUTE FUNCTION sync_person_to_resend();
```

**Benefits:**
- All people automatically in Resend
- Can use Resend's audience management
- Better deliverability tracking
- Foundation for future segmentation

---

### Phase 3: Enhanced Webhook Handling (Medium Priority)

#### Update `/api/email-webhook` to handle all email types

**Current:**
```javascript
// Only updates emails table
await supabase
  .from('emails')
  .update(updateData)
  .eq('id', emailRecord.id);
```

**Improved:**
```typescript
// Update individual email record
await supabase
  .from('emails')
  .update(updateData)
  .eq('resend_id', data.email_id);

// If part of broadcast, update aggregate stats
const { data: email } = await supabase
  .from('emails')
  .select('broadcast_id')
  .eq('resend_id', data.email_id)
  .single();

if (email?.broadcast_id) {
  // Increment broadcast counters
  await supabase.rpc('increment_broadcast_stat', {
    broadcast_id: email.broadcast_id,
    stat_name: type // 'delivered', 'opened', 'clicked', etc.
  });
}
```

**New Events to Handle:**
- `email.sent`
- `email.delivered` ✅ (already handled)
- `email.opened` ✅ (already handled)
- `email.bounced` ✅ (already handled)
- `email.complained` ✅ (already handled)
- `email.clicked` ❌ (NEW)

---

### Phase 4: Unified Email Composer (Medium Priority)

#### Create `UnifiedEmailComposer` component

**Features:**
- Single component for all email types
- Preview before sending
- Template selection
- Recipient management (individuals, teams, lists)
- Schedule for later
- A/B testing options
- Save as draft

**Usage:**
```tsx
<UnifiedEmailComposer
  recipients={people}
  recipientType="team" | "list" | "individuals"
  onSend={handleSend}
  account={account}
  availableTemplates={['basic', 'invoice', 'newsletter']}
/>
```

**Replace:**
- `SendEmailSheet` (teams & people)
- Broadcasts UI
- Invoice email flows

---

### Phase 5: Email Analytics Dashboard (Low Priority)

#### Create comprehensive analytics

**Metrics:**
- Total sent
- Delivery rate
- Open rate (overall & per campaign)
- Click rate
- Bounce rate
- Complaint rate
- Best performing times
- Engagement by segment

**UI Location:** `/emails/analytics`

---

### Phase 6: Advanced Features (Future)

1. **Email Scheduling**
   - Schedule emails for specific times
   - Timezone-aware sending
   - Recurring campaigns

2. **Template Builder**
   - Visual email template editor
   - Custom templates per account
   - Template versioning

3. **A/B Testing**
   - Subject line testing
   - Content testing
   - Send time optimization

4. **Unsubscribe Management**
   - Auto-respect unsubscribes
   - Preference center
   - Re-engagement campaigns

5. **Email Sequences**
   - Drip campaigns
   - Onboarding sequences
   - Follow-up automations

---

## Implementation Priority

### ✅ Must Do (Week 1-2)
1. ✅ Create unified `/api/email/send` endpoint
2. ✅ Migrate existing send methods to use new API
3. ✅ Implement Resend batch sending
4. ✅ Ensure all emails log to database

### 🟡 Should Do (Week 3-4)
5. 🟡 Auto-sync people to Resend contacts
6. 🟡 Update webhook to handle all email types
7. 🟡 Add click tracking
8. 🟡 Update broadcast stats in real-time

### 🔵 Nice to Have (Month 2)
9. 🔵 Create `UnifiedEmailComposer` component
10. 🔵 Build email analytics dashboard
11. 🔵 Add email scheduling

### 🟣 Future (Month 3+)
12. 🟣 Template builder
13. 🟣 A/B testing
14. 🟣 Email sequences
15. 🟣 Advanced segmentation

---

## Technical Specifications

### Database Changes Needed

```sql
-- Add click tracking
ALTER TABLE emails 
ADD COLUMN clicked_at timestamp with time zone,
ADD COLUMN click_count integer DEFAULT 0;

-- Add click_count to broadcasts
ALTER TABLE broadcasts
ADD COLUMN IF NOT EXISTS total_clicked integer DEFAULT 0;

-- Create broadcast stats RPC function
CREATE OR REPLACE FUNCTION increment_broadcast_stat(
  broadcast_id uuid,
  stat_name text
) RETURNS void AS $$
BEGIN
  CASE stat_name
    WHEN 'delivered' THEN
      UPDATE broadcasts 
      SET total_delivered = total_delivered + 1 
      WHERE id = broadcast_id;
    WHEN 'opened' THEN
      UPDATE broadcasts 
      SET total_opened = total_opened + 1 
      WHERE id = broadcast_id;
    WHEN 'clicked' THEN
      UPDATE broadcasts 
      SET total_clicked = total_clicked + 1 
      WHERE id = broadcast_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Add sender verification tracking
CREATE TABLE IF NOT EXISTS sender_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  domain text NOT NULL,
  verified_at timestamp with time zone,
  dns_records jsonb,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(account_id, domain)
);
```

### API Changes

**New Endpoints:**
- `POST /api/email/send` - Unified sending
- `POST /api/email/schedule` - Schedule emails
- `GET /api/email/analytics` - Get analytics
- `POST /api/resend/sync-contact` - Manual contact sync
- `GET /api/resend/verify-domain` - Check domain verification

**Deprecated (after migration):**
- `/api/send-emails` → Use `/api/email/send`
- `/api/invite-person` → Use `/api/email/send`

**Keep:**
- `/api/broadcasts/create` - Can wrap `/api/email/send`
- `/api/invoices/resend` - Can wrap `/api/email/send`
- `/api/email-webhook` - Enhanced, not replaced

---

## Success Metrics

### Performance
- ⬇️ Reduce email send time by 80% (batch vs. loop)
- ⬆️ Increase deliverability rate to >98%
- ⬇️ Reduce bounce rate to <2%

### Coverage
- ⬆️ 100% of emails logged to database
- ⬆️ 100% of people synced to Resend contacts
- ⬆️ Real-time delivery tracking for all emails

### User Experience
- ⬆️ Single email composer for all use cases
- ⬆️ Email preview before sending
- ⬆️ Comprehensive analytics dashboard

---

## Questions for Product Decision

1. **Should we support email scheduling?** (Adds complexity but valuable feature)
2. **Do we need A/B testing?** (Useful for marketing teams)
3. **Template builder priority?** (vs. using pre-built templates)
4. **Unsubscribe management approach?** (Central preference center vs. per-list)
5. **Should broadcasts create individual `emails` records?** (Better tracking but more DB rows)

---

## Next Steps

1. Review this plan with the team
2. Prioritize phases based on business needs
3. Start Phase 1: Unified Email API
4. Set up monitoring and error tracking
5. Create migration plan for existing functionality

Would you like me to start implementing Phase 1?

