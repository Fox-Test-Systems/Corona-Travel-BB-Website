import type { StaffMember } from "./types";

/**
 * Staff members who receive SMS notifications and/or can edit the website.
 * Up to 4 coaches + 1 team representative.
 *
 * Configure via environment variables:
 *   STAFF_1_NAME, STAFF_1_ROLE, STAFF_1_PHONE, STAFF_1_SMS
 *   STAFF_2_NAME, STAFF_2_ROLE, STAFF_2_PHONE, STAFF_2_SMS
 *   ... up to STAFF_5
 *
 * Phone numbers must be E.164 format (e.g. +15551234567)
 */
export function getStaffMembers(): StaffMember[] {
  const staff: StaffMember[] = [];

  for (let i = 1; i <= 5; i++) {
    const name = process.env[`STAFF_${i}_NAME`];
    const role = process.env[`STAFF_${i}_ROLE`];
    const phone = process.env[`STAFF_${i}_PHONE`];
    const sms = process.env[`STAFF_${i}_SMS`];

    if (name && role && phone) {
      staff.push({
        name,
        role: role as StaffMember["role"],
        phone,
        receives_sms: sms !== "false", // defaults to true
      });
    }
  }

  return staff;
}

export function getSmsRecipients(): string[] {
  return getStaffMembers()
    .filter((s) => s.receives_sms)
    .map((s) => s.phone);
}
