const sites: [string, string][] = [
  ['Claude Code', 'https://claude.com/product/claude-code'],
  ['Claude', 'https://claude.ai'],
  ['Cloudflare Web Analytics', 'https://www.cloudflare.com/web-analytics/'],
  ['Cloudflare Workers', 'https://workers.cloudflare.com'],
  ['Cloudflare', 'https://www.cloudflare.com'],
  ['GitHub Actions', 'https://github.com/features/actions'],
  ['Amazon EKS', 'https://aws.amazon.com/eks/'],
  ['Talos Linux', 'https://www.talos.dev'],
  ['Proxmox VE', 'https://www.proxmox.com/en/proxmox-virtual-environment/overview'],
  ['Ghost CMS', 'https://ghost.org'],
  ['Rose-Hulman Institute of Technology', 'https://www.rose-hulman.edu'],
  ['LaunchDarkly', 'https://launchdarkly.com'],
  ['Lighthouse CI', 'https://github.com/GoogleChrome/lighthouse-ci'],
  ['Lighthouse', 'https://developer.chrome.com/docs/lighthouse'],
  ['Playwright', 'https://playwright.dev'],
  ['Turnstile', 'https://www.cloudflare.com/application-services/products/turnstile/'],
  ['1Password', 'https://1password.com'],
  ['Renovate', 'https://docs.renovatebot.com'],
  ['OPNsense', 'https://opnsense.org'],
  ['Terraform', 'https://developer.hashicorp.com/terraform'],
  ['Atlantis', 'https://www.runatlantis.io'],
  ['Hill-Rom', 'https://www.hillrom.com'],
  ['Datadog', 'https://www.datadoghq.com'],
  ['Consul', 'https://developer.hashicorp.com/consul'],
  ['Resend', 'https://resend.com'],
  ['Drexel University', 'https://drexel.edu'],
  ['Astro', 'https://astro.build'],
  ['axe', 'https://www.deque.com/axe/'],
  ['Bun', 'https://bun.sh'],
  ['mise', 'https://mise.jdx.dev'],
  ['Olo', 'https://www.olo.com'],
  ['Tour Divide', 'https://tourdivide.org/'],
  ['Agent of Empires', 'https://www.agent-of-empires.com/'],
];

const escape = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function linkify(text: string) {
  let html = escape(text);
  for (const [name, url] of sites) {
    const pattern = new RegExp(
      `(^|[^\\w>"/-])(${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})(?![\\w-]|[^<]*</a>)`,
    );
    html = html.replace(
      pattern,
      (_, before, match) => `${before}<a href="${url}" target="_blank" rel="noopener">${match}</a>`,
    );
  }
  return html;
}
