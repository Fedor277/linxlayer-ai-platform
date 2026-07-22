# RunPod Deployment Assets

These files are intentionally descriptive rather than a production Pod export. They avoid publishing account IDs, Pod IDs, data-center selections, volume IDs, registry credentials, private DNS names, or secret values.

## Suggested Pod roles

| Pod | Purpose | Public exposure |
|---|---|---|
| Text inference | vLLM and approved text model | Private only |
| Image inference | Diffusion/workflow image service | Private only |
| Gateway | Authentication and policy enforcement | HTTPS endpoint only |

The gateway may also run outside RunPod on conventional CPU infrastructure.

## Template environment variables

Use [`text-pod.environment.example`](text-pod.environment.example) as a checklist. Values using `RUNPOD_SECRET_...` are placeholders for runtime secret references, not real credentials.

## Storage

Attach the selected persistent storage during Pod creation. Keep downloads and caches below `/workspace` when that is the mounted persistent path for the chosen configuration.

## Networking

When supported for the chosen Pods and data centers, use RunPod private networking for Pod-to-Pod traffic. Address services using their internal DNS names and keep API authentication enabled between services.

## Sanitization

Before committing an exported template, remove:

- Pod and volume IDs;
- account, team, and registry identifiers;
- public IPs and private DNS names;
- SSH keys;
- API keys and secret names that reveal internal systems;
- model-repository tokens;
- customer or project names.
