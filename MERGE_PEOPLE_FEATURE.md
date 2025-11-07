# People Merge Feature

## Overview

The People Merge feature allows you to combine duplicate person records into a single record. This is useful when you have created duplicate entries for the same person due to data entry errors, imports, or other reasons.

## How to Use

### Step 1: Select Two People to Merge

1. Navigate to the **People** tab
2. Use the checkboxes to select **exactly 2 people** you want to merge
3. A **"Merge Records"** button will appear in the action bar

### Step 2: Choose the Primary Record

1. Click the **"Merge Records"** button
2. A modal will open showing both people side-by-side
3. Select which person should be the **Primary Record**
   - The primary record will be kept
   - The secondary record will be deleted after merging
   - All data from the secondary record will be transferred to the primary record

### Step 3: Select Data to Keep

For each field, choose which value you want to keep:

- **Name**: First and last name
- **Email**: Email address
- **Phone**: Phone number
- **Birthdate**: Date of birth
- **Grade**: Current grade level
- **Type**: Whether they are a dependent or primary contact
- **Tags**: You can choose tags from either person or combine all tags from both

### Step 4: Review and Confirm

Before merging, review the information that will be transferred:

- All relationships (parent/guardian connections)
- All team memberships and roster entries
- All invoices and payment history
- All email history and list memberships
- Stripe customer information (if any)

### Step 5: Complete the Merge

Click **"Merge Records"** to complete the process. The system will:

1. Update all foreign key references to point to the primary record
2. Transfer all relationships, team memberships, invoices, and emails
3. Update the primary record with your selected data
4. Delete the secondary record

## What Gets Merged

### Relationships
- All parent/guardian relationships are transferred
- Both `person_id` and `relation_id` references are updated
- No duplicate relationships are created

### Team Memberships
- All roster entries are transferred
- Team history is preserved

### Financial Records
- All invoices remain linked via roster entries
- All payment history is transferred
- Stripe customer information is preserved

### Email & Communications
- All sent emails are transferred
- Email list memberships are consolidated (duplicates removed)
- Email history is preserved

### Personal Data
- You choose which data to keep for each field
- Tags can be combined or selected from one person

## Important Notes

⚠️ **This action cannot be undone**. Once merged, the secondary person record is permanently deleted.

✅ The merge process is atomic - if any part fails, the entire operation is rolled back.

🔒 Security - You can only merge people within your own account. The system verifies ownership before proceeding.

## Technical Details

### Database Tables Updated

1. **relationships** - Both `person_id` and `relation_id` columns
2. **rosters** - `person_id` column
3. **list_people** - `person_id` column (duplicates removed)
4. **emails** - `recipient_id` column
5. **payments** - `person_id` column
6. **staff** - `person_id` column (if applicable)
7. **people** - Primary record updated, secondary record deleted

### API Endpoint

- **Route**: `/api/merge-people`
- **Method**: POST
- **Body**:
  ```json
  {
    "primaryPersonId": "uuid",
    "secondaryPersonId": "uuid",
    "mergedData": {
      "first_name": "string",
      "last_name": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "birthdate": "date",
      "grade": "string",
      "dependent": boolean,
      "tags": ["string"]
    }
  }
  ```

### Components

- **Modal**: `/components/modal/merge-people-modal.tsx`
- **API Route**: `/app/api/merge-people/route.ts`
- **Table Integration**: `/app/(dashboard)/people/table.tsx`

## Error Handling

The system includes comprehensive error handling:

- Validates that exactly 2 people are selected
- Verifies both people exist and belong to your account
- Prevents merging a person with themselves
- Handles conflicting list memberships gracefully
- Provides clear error messages if something goes wrong

## Future Enhancements

Potential improvements for future versions:

- Merge preview showing all affected records before confirmation
- Ability to merge more than 2 people at once
- Undo functionality (restore deleted person within a time window)
- Merge history/audit log
- Automatic duplicate detection suggestions

