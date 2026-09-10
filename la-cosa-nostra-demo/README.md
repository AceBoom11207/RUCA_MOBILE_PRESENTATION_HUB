# La Cosa Nostra — interactive public demo

This is a self-contained functional simulation of the existing La Cosa Nostra command center. The source application is a private, local-first prototype; this public adaptation makes its workflows reviewable without provider sessions, local files, a backend, or private records.

## Source and visual ownership

The HTML, CSS, browser UI, RUCA imagery and provider marks were copied from the existing command-center frontend at source commit `26b9c4e`. Its Revenue Board, Command, Tasks, Calendar, The Books, Collaborative Preview, Connections, timepiece, color controls and eight named provider roles are preserved. Responsive containment and a public guide were added. Provider marks identify the roles in the source product; they do not imply endorsement or a connected integration.

The service catalogue and sample price ranges come from the source's literal service configuration. Prices, clients, pipeline totals, outputs and execution are illustrative. No real-client acquisition, business revenue, payment, verified provider execution or external research is claimed.

## Try the workflows

- Revenue: **Try Revenue Workflow** → Evaluate locally → Pursue → Generate proposal → Approve proposal → Mark sample submitted → Mark sample won → Record sample contract and deposit → Activate sample project → Convert to production mission.
- Mission: open the plan in Collaborative Preview and approve the lane. Prepared lanes advance every few seconds, pausing for visual review and final delivery. Send back uses the optional revision note; reject stops the mission. Stop/resume/reset work at studio, mission, member and task scopes.
- Invoice: Revenue → View Projects & Invoices → Create draft invoice → Finalize invoice → Record sample payment. Follow-up records appear and can be completed. No invoice is sent and no money changes hands.
- Delivery: after all mission lanes are approved, use the selected opportunity's Compile Final Package action. Download the sample handoff in Collaborative Preview; sample delivery/receipt records and portfolio draft → case study → website asset progression are available.
- Add your own fictional mission, opportunity, client, discovery or project-registry entry. Search and filter Tasks, Calendar and The Books. Reload or Reset Demo restores the initial sample records.

## Public boundary

`demo-data.js` is an in-memory state machine replacing every source API call. There are no fetch calls, provider SDKs, sockets, API credentials, real clients, local endpoints, database records or copied private outputs. The page enforces `connect-src 'none'` and `form-action 'none'`. Only color preference uses browser local storage; all workflow state stays in this tab's memory. Synthetic records cannot satisfy real-business attestations. Package downloads contain the approved prepared sample outputs.

A fixed fixture illustrates provider responsibility, progress and revisions. It does not run AI or adapt the underlying prepared analysis to arbitrary briefs. The source implementation's real cancellation tokens, process control, provider retries, filesystem locks and backend persistence are outside this demo.

## Verification

The adapter passed 32 assertions covering proposal sequencing/revisions, conversion gates, plan/visual approval, revision notes, reject/reset behavior, stop/resume, preserved ledger/checkpoint history, delivery packages, invoice states, synthetic payment metrics, follow-ups, portfolio progression and refusal to attest fictional records as real. All browser JavaScript passed syntax checks. Visual/browser verification and release evidence are recorded by the integrating task.
