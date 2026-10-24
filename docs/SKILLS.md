# Local skill provenance

Verified 24 October 2026 in this cloud machine. Both packages are installed in the repository's
`.agents/skills/` directory for future checkouts; neither existed locally before preparation.

| Skill | Official repository | Exact revision | Retained files |
|---|---|---|---|
| Anatomy | https://github.com/wheresryan22/anatomy | `1482e8469b0a9e0d8cc18ea2740a01423d29ae80` | All upstream files except Git metadata and GitHub administration; toolkit, scripts, examples, tests, references, README and MIT licence |
| Reverse Engineer Anything | https://github.com/morluto/rea | `9fd78a74f84a8e924bd58e7deaf5934bfb24f53c` | Complete `.agents/skills/reverse-engineer-anything` directory plus upstream MIT licence |

163 Anatomy files and 7 REA skill files were compared byte-for-byte with their pinned checkouts.
REA's licence is an eighth file. All 171 files have SHA-256 entries in `skill-files.sha256.json`.
Both SKILL.md YAML headers parse with matching names and descriptions. This is a local integrity
and metadata check, not a claim of external skill-platform publication.

The Anatomy Node example build, CDP capture helper and Playwright tests execute successfully.
The skill's optional WebGL/3D and PDF capabilities have not been validated for this project.
REA's MCP server and engines are not installed or registered. At the pinned revision the optional
runtime declares Node `^22.23.4 || ^24.22.1 || >=26.12.1` and npm `11.16.0`; current Node 24.19.0
and npm 11.9.0 do not meet that runtime declaration. Source-based SVG development does not need it.
Preserve both licences with reused code. Cloud-catalog availability is separate from these local files.

## Architectural-study revision

The published `rea-agents@6.7.0` browser CLI was subsequently installed and successfully exercised
on the existing Room Anatomy app. Its published engine range accepts Node 24.19.0, unlike the
recorded source-checkout range above. Locked manifests are in `tooling/rea/`; the originally pinned
skill files remain unchanged. No MCP registration or native analysis engine was installed. See
`ARCHITECTURAL_STUDY_REVISION.md` for complete evidence, limitations and the reference-access blocker.
