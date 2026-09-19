# Manual setup — the tasks only Keith can do

Everything below needs your accounts or your approval. Each step says what to do, what to record (and where), and how I'll know it's done. Do them in order; steps 1 and 2 unblock me immediately, steps 3–7 unblock the first real deploy.

Nothing in this guide should ever be pasted into the repository, an issue, or the chat. Secrets go into 1Password; the only value that goes into GitHub is the 1Password service-account token, and it goes into GitHub's encrypted secrets.

---

## 1. Give this session write access to the repo  *(unblocks everything)*

The repo is cloned on your Mac with an SSH remote and the Claude workspace has no SSH key or GitHub credential, so today I can read the public repo but cannot push, open issues, create the project board or change settings.

**Option A (chosen): continue in a terminal Claude Code session.** A running Cowork session cannot be given a new repository (GitHub access is fixed when a session starts), so the build moves to the Claude Code CLI on your Mac, where your existing `gh` login and SSH key already have push access. Steps: `cd ~/git-repos/keith-huster-dot-com-site`, `gh auth status` (run `gh auth refresh -s workflow,project` so the session can push workflow files and manage the Project board), start `claude`, and paste the prompt from `docs/plan/HANDOFF-PROMPT.md` after filling in its M0 completion report. That session pushes the pending local commit and does everything in §9.

**Option B (not needed if you use Option A): a fine-grained personal access token for a cloud session.**
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → *Generate new token*.
2. Name `claude-keithhuster-site`, expiration 30 days, resource owner `husterk`, repository access: **Only select repositories → keith-huster-dot-com-site**.
3. Repository permissions: Administration **Read and write** (settings, branch protection), Contents **Read and write**, Issues **Read and write**, Pull requests **Read and write**, Workflows **Read and write** (needed to push `.github/workflows`), Metadata Read.
4. Account permissions: Projects **Read and write** (the board is a user-level Project).
5. Store the token in 1Password (item `GitHub PAT · keithhuster site`, vault `secrets_keith-huster-dot-com-site` — see step 3). Then either give me the `op://` reference to read with the CLI on your Mac, or save it to `/Users/keithhuster/git-repos/keith-huster-dot-com-site/.secrets/gh_token` (that path is gitignored; I'll delete the file when done). Do **not** paste it into the chat.
6. Revoke the token when the build is finished.

I'll switch the clone's remote to HTTPS for pushes while the token is in use and switch it back afterwards.

## 2. Confirm three repository settings I cannot change by API

Repo → Settings:

- **Forking**: GitHub does not allow disabling forks on a public repository owned by a personal account (the option exists only for private repos and organization repos). If preventing forks matters, the alternatives are making the repo private or moving it to an organization. Otherwise accept that public code can be forked; the MIT license covers the code and the LICENSE file reserves the content and illustrations.
- **Wiki**: leave *off* (docs live in `docs/`). I'll set this by API once I have access, but check it after.
- **Discussions**: off.

## 3. 1Password: vault, items, service account  *(≈15 min)*

1. Create a vault named **`secrets_keith-huster-dot-com-site`**.
2. Create these items in it (exact titles and field names matter; the workflows read them by `op://` reference):

   | Item title | Fields | Filled in step |
   |---|---|---|
   | `Cloudflare API token` | `credential` (the token), `account id` (text) | 4 |
   | `Resend` | `credential` (the API key) | 5 |
   | `Turnstile` | `site key` (text), `secret key` (password) | 6 |

   Use the *API Credential* item type for the first two and a *Password* item with two custom fields for Turnstile.
3. Create a **Service Account**: 1Password → Developer → Service Accounts → *Create*. Name `github-actions-keithhuster`, grant **read** access to the `secrets_keith-huster-dot-com-site` vault only. Copy the token once.
4. GitHub repo → Settings → Secrets and variables → Actions → *New repository secret*: name **`OP_SERVICE_ACCOUNT_TOKEN`**, value = the service-account token. This is the only GitHub secret the project will ever have.
5. Optional but useful: `op vault list` on your Mac should show the vault; `op read "op://secrets_keith-huster-dot-com-site/Cloudflare API token/credential"` will work once step 4 is done.

**Done when:** the four items exist and the GitHub secret is set. Tell me "1Password done".

## 4. Cloudflare: API token, account ID  *(≈10 min)*

1. Cloudflare dashboard → profile (top right) → *API Tokens* → *Create Token* → *Create Custom Token*.
2. Name `github-actions-keithhuster-site`. Permissions:
   - Account · **Workers Scripts · Edit**
   - Account · **Account Settings · Read** *(Wrangler uses it to resolve the account)*
   - Zone · **Workers Routes · Edit** for zone `keithhuster.com` *(required to add the custom domain; Cloudflare creates the DNS record itself when the route is bound — there is no account-level "Workers Routes" permission)*
   - Optional: Zone · **DNS · Edit** for `keithhuster.com`, only if the custom-domain step at launch complains about an existing record; otherwise leave it off
3. Account resources: include only your account. Zone resources: include only `keithhuster.com`. Client IP filtering: leave empty (GitHub runners). TTL: no end date, or one year.
4. Copy the token into the 1Password item `Cloudflare API token` → `credential`. Put your **Account ID** (Workers & Pages overview page, right-hand column) into the `account id` field.

**Done when:** both fields are filled. Tell me "Cloudflare token done".

## 5. Resend: sending domain and API key  *(≈10 min + DNS propagation)*

1. Resend → Domains → *Add Domain* → `keithhuster.com`, region US East.
2. Resend shows three DNS records (a DKIM TXT, an MX and a TXT for the `send` subdomain used for bounces, and a DMARC TXT). Add each in Cloudflare → `keithhuster.com` → DNS. For the MX/TXT records set proxy status to *DNS only* (grey cloud).
3. Back in Resend, click *Verify*. Usually completes within minutes.
4. Resend → API Keys → *Create API Key*: name `keithhuster-site-worker`, permission **Sending access**, domain **keithhuster.com** only.
5. Copy the key into the 1Password item `Resend` → `credential`.

**Done when:** the domain shows *Verified* and the key is stored. Tell me "Resend done". (If you'd rather skip domain verification for now, say so; the form can send from Resend's shared `onboarding@resend.dev` sender to your own address only, and we can verify the domain later.)

## 6. Cloudflare Turnstile widget  *(≈3 min)*

1. Cloudflare dashboard → Turnstile → *Add widget*.
2. Name `keithhuster.com contact form`; hostnames `keithhuster.com` **and** `keithhuster-com.<your-subdomain>.workers.dev` (so previews work; find the subdomain under Workers & Pages → your account's workers.dev subdomain). Widget mode **Managed**. Pre-clearance off.
3. Copy the **site key** into 1Password `Turnstile` → `site key` and the **secret key** into `secret key`. The site key is public and will also be committed in `src/content/site.yaml`; tell me the site key in chat (it's safe to share, it appears in the page HTML).

**Done when:** both keys are stored and you've sent me the site key.

## 7. Cloudflare Web Analytics  *(≈2 min)*

1. Cloudflare dashboard → Analytics & Logs → Web Analytics → *Add a site* → hostname `keithhuster.com`, **do not** enable automatic setup (the site isn't proxied through the zone until launch).
2. Copy the beacon snippet's `token` value and send it to me in chat (it's public; it's embedded in the page).

## 8. Later, at launch (I'll tell you when)

- **Bulk redirect** `www.keithhuster.com` → `https://keithhuster.com` (301, preserve path): Cloudflare → Bulk Redirects → create a list with that one rule and a redirect rule that uses it. I'll give exact values at M4.
- **Old site**: know where the current keithhuster.com is hosted and how to take it down or repoint it; the custom-domain step will replace the apex DNS record.
- **LinkedIn / résumé**: point them at the new site after launch.

## 9. Things the Claude Code session will do once step 1 is complete (no action needed)

Repository settings via API (default branch `main`, squash-merge only with auto-delete of head branches, branch protection requiring the `ci` check and PRs, wiki/projects/discussions toggles, vulnerability alerts, secret scanning + push protection), labels, milestones M0–M5, the user-level GitHub Project board with a Status field and one issue per work item, and the first commit with `docs/`, `LICENSE`, `SECURITY.md`, `CODEOWNERS`, `renovate.json` and `.gitignore`.

---

### Quick checklist

- [ ] 1. Repo access for this session (Option A or B)
- [ ] 2. Forking decision acknowledged; wiki and discussions off
- [ ] 3. 1Password vault `secrets_keith-huster-dot-com-site`, three items, service account, GitHub secret `OP_SERVICE_ACCOUNT_TOKEN`
- [ ] 4. Cloudflare API token + account ID in 1Password
- [ ] 5. Resend domain verified + sending-only API key in 1Password
- [ ] 6. Turnstile widget; keys in 1Password; site key sent to me
- [ ] 7. Web Analytics site; beacon token sent to me
