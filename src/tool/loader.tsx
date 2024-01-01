import { User, Tool } from '../core/type';

export interface Register {
  user: User,
  tools: Tool[]
}

const registry = new Map<string, Register>();

/**将指定注册表合并至文档的总表中。 */
export function load(r: Register) {
  const unl = r.user.username.toLowerCase();
  let u = registry.get(unl);
  if (!u) {
    u = { user: r.user, tools: [] };
    registry.set(unl, u);
  }
  for (const t of r.tools)
    u.tools.push(t);
  return u;
}

export function get(username: string, toolname: string): { user: User, tool: Tool } | undefined {
  username = username.toLowerCase();
  toolname = toolname.toLowerCase();
  const reg = registry.get(username);
  if (!reg) return;
  const tools = reg.tools;
  for (const tl of tools) {
    if (tl.name.toLowerCase() === toolname)
      return { user: reg.user, tool: tl };
  }
}