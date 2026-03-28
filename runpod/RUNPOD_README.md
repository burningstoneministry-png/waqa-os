# RunPod + Ollama + Cline — Quick Reference

> **Model:** Qwen 2.5 Coder 32B &nbsp;|&nbsp; **GPU:** RTX 4090 (24GB) &nbsp;|&nbsp; **Cost:** ~$0.34/hr
> **Pod ID:** hzyc826450y9h7

---

## Daily Startup (run these every session)

```bash
./start_session.sh
```

Both Ollama and Open WebUI will be up in ~15 seconds.

---

## Your URLs

| Service | URL |
|---|---|
| Open WebUI (chat) | https://hzyc826450y9h7-3000.proxy.runpod.net |
| Ollama API | https://hzyc826450y9h7-11434.proxy.runpod.net/v1 |

---

## Cline Settings (paste into VS Code)

Go to `.vscode/settings.json` in your project (or global User Settings JSON):

```json
{
  "cline.apiProvider": "openai-compatible",
  "cline.openAiBaseUrl": "https://hzyc826450y9h7-11434.proxy.runpod.net/v1",
  "cline.openAiApiKey": "ollama",
  "cline.openAiModelId": "qwen2.5-coder:32b",
  "cline.contextWindow": 32768,
  "cline.maxTokens": 8192,
  "cline.requestTimeoutMs": 300000,
  "cline.useCompactPrompt": true
}
```

**`useCompactPrompt: true` is required** — without it, long sessions will fail.

---

## Useful Ollama Commands

| Command | What it does |
|---|---|
| `ollama list` | Show installed models |
| `ollama pull qwen2.5-coder:32b` | Download/update the model |
| `ollama pull qwen2.5-coder:14b` | Smaller model (if <24GB VRAM) |
| `ollama rm qwen2.5-coder:32b` | Delete a model (frees disk) |
| `ollama run qwen2.5-coder:32b` | Interactive chat in terminal |
| `ollama ps` | Show models loaded in GPU memory |

---

## Troubleshooting

```bash
./healthcheck.sh
```

| Problem | Fix |
|---|---|
| Ollama not running | `./start_session.sh` |
| Open WebUI stopped | `docker start open-webui` |
| No models installed | `ollama pull qwen2.5-coder:32b` |
| Cline times out | Check `requestTimeoutMs` is `300000` |
| Port not accessible | Verify 11434 and 3000 in RunPod HTTP port settings |

---

## When to Use This vs Claude Code

| Task | Use |
|---|---|
| Routine scaffolding, CRUD, boilerplate | **This (Ollama + Cline)** |
| Complex architecture, hard bugs | **Claude Code premium** |
| Quick questions, explanations | **Open WebUI chat** |
| Claude Code tokens exhausted | **This (Ollama + Cline)** |

---

## Scripts

| Script | When to run |
|---|---|
| `setup.sh` | **Once only** — first time setup |
| `start_session.sh` | **Every session** |
| `healthcheck.sh` | When something seems broken |
| `mount_volume.sh` | Once, if you have a Network Volume |

---

## Stop the Pod

**Always stop from the RunPod dashboard when done — you are billed by the minute.**

RunPod Dashboard → Your Pod → **Stop Pod**

---

*Setup completed with Claude Code — March 2026*
