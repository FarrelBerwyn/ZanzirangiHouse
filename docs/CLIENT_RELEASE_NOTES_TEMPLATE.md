# Client Release Notes — Template & Writing Guide

Audience: **Zanzirangi House** (owners and staff). Prepared and sent by **TKS**.
Copy the template below to `docs/releases/vX.Y.Z/CLIENT_RELEASE_NOTES.md` for each release, then send it to
the client (email/WhatsApp, as text or PDF) on the day of the production deployment.

## Writing rules

- Write for hotel staff, not engineers. Describe what guests or staff will **notice**, and why it helps the business.
- Never mention: Git, branches, commits, pull requests, servers, databases, hosting, APIs, code, file names, environment variables, security vulnerabilities or attack details, internal URLs, passwords or keys.
- Security fixes: say "Security and reliability improvements were applied." Do not describe the weakness.
- Leave out sections that have nothing to report (e.g. no bug fixes → omit "Bug Fixes").
- **Action Required** is always present. If the client has nothing to do, say so explicitly.
- Use the release date in long form (e.g. 1 October 2026) and the version as `v1.2.0`.

---

## Template

```markdown
# Zanzirangi Website Update

**Version:** vX.Y.Z
**Release Date:** D Month YYYY

## What's New
- <New capability, explained by its benefit. e.g. "You can now update homepage sections yourself from the Admin Dashboard.">

## Improvements
- <e.g. "Pages load faster on mobile phones.">

## Bug Fixes
- <e.g. "Fixed an issue where some staff could not log in to the Admin Dashboard.">

## Action Required
<"No action required. TKS has deployed the update successfully."
 — or a short, numbered list of what the client should do, e.g. "Please review the new Dining page text before 10 October.">

## Need Help?
If you notice anything unexpected, contact your TKS team at <TKS support contact>.
You can always see the current version at the bottom of the Admin Dashboard menu ("System Version").
```

---

## Example

```markdown
# Zanzirangi Website Update

**Version:** v1.2.0
**Release Date:** 1 October 2026

## What's New
- Zanzirangi can now update homepage content from the Admin Dashboard.
- Image management has been improved: photos can be uploaded once and reused across pages.

## Improvements
- Website loading speed improved.
- Mobile layout improved.
- Search engine information (titles and descriptions) improved.

## Bug Fixes
- Fixed an admin login issue.
- Fixed a mobile navigation issue.

## Action Required
No action required. TKS has deployed the update successfully.
```
