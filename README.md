# Room Anatomy

An interactive complete-bedroom explainer is planned. **Project preparation is complete;
application implementation has not started and awaits the user's instruction.**

- [Full handoff](docs/Room_Anatomy_RDB_Build_Plan.md)
- [Project instructions](AGENTS.md)
- [RDB phase checklist](docs/PHASE_CHECKLIST.md)
- [Environment results and tool check](docs/SETUP.md)
- [Local skill provenance](docs/SKILLS.md)

The selected basis is the proposed demonstration bedroom. RDB means Requirements → Design → Build.
The initial deliverable will be the core interactive app and standalone HTML; video/audio are optional.

To repeat the preparation checks:

```sh
cd /workspace/singlebedroomdetails
python3 scripts/check-environment.py
```

This runs an upstream Anatomy example in a temporary directory, checks Chromium/Playwright,
and verifies the encoder. It does not create the bedroom app.
