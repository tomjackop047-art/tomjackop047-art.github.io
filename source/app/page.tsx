"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type Expert = {
  name: string;
  streak: string;
  best: number;
  numbers: number[];
  url: string;
};

const experts: Expert[] = [
  {
    name: "彩运2016",
    streak: "近10中6期",
    best: 5,
    numbers: [2, 3, 4, 5, 6, 9, 11, 12, 13, 14, 15, 16, 20, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
    url: "https://www.yiqicai.com/ex/dltex/tjxq_39_580_2026085.html",
  },
  {
    name: "傻欣欣",
    streak: "近10中6期",
    best: 4,
    numbers: [1, 3, 4, 5, 6, 7, 8, 9, 12, 13, 16, 17, 19, 20, 21, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34],
    url: "https://www.yiqicai.com/ex/dltex/tjxq_39_788_2026085.html",
  },
  {
    name: "材叔",
    streak: "近10中6期",
    best: 4,
    numbers: [2, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 16, 19, 20, 21, 22, 23, 25, 27, 28, 30, 32, 33, 34, 35],
    url: "https://www.yiqicai.com/ex/dltex/tjxq_39_1402_2026085.html",
  },
  {
    name: "木星的王",
    streak: "近10中6期",
    best: 4,
    numbers: [1, 2, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 26, 29, 31, 34, 35],
    url: "https://www.yiqicai.com/ex/dltex/tjxq_39_1737_2026085.html",
  },
  {
    name: "泪梦",
    streak: "近10中6期",
    best: 3,
    numbers: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 18, 19, 20, 21, 22, 24, 25, 26, 27, 30, 32, 33, 34, 35],
    url: "https://www.yiqicai.com/ex/dltex/tjxq_39_317_2026085.html",
  },
];

const killers = [
  { name: "专业大神", score: "近10中10 · 18连红", nums: [3, 10, 17] },
  { name: "月圆花好", score: "近10中10 · 18连红", nums: [2, 8, 30] },
  { name: "大宝贝", score: "近10中10 · 17连红", nums: [10, 12, 19] },
  { name: "寄劫丶", score: "近10中10 · 16连红", nums: [3, 5, 6] },
  { name: "allison", score: "近10中10 · 15连红", nums: [18, 19, 23] },
  { name: "必中一等奖", score: "近10中10 · 15连红", nums: [8, 15, 23] },
  { name: "沫沫小宝贝", score: "近10中10 · 14连红", nums: [9, 16, 33] },
  { name: "刘畅", score: "近10中10 · 14连红", nums: [14, 26, 30] },
];

type Filter = "all" | "conflict" | "repeat";
type ViewMode = "single" | "collection";
type CollectionRule = "any" | "majority" | "all";
type Killer = { name: string; score: string; nums: number[]; url?: string };
type DashboardData = { issue: string; experts: Expert[]; killers: Killer[]; updatedAt?: string };

export default function Home() {
  const [data, setData] = useState<DashboardData>({ issue: "2026085", experts, killers });
  const [selected, setSelected] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedExperts, setSelectedExperts] = useState<string[]>(experts.map((expert) => expert.name));
  const [selectedKillers, setSelectedKillers] = useState<string[]>(killers.map((expert) => expert.name));
  const [collectionRule, setCollectionRule] = useState<CollectionRule>("majority");
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshState, setRefreshState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [refreshMessage, setRefreshMessage] = useState("页面当前显示已整理数据");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [refreshPassword, setRefreshPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const active = data.experts[selected] ?? data.experts[0];
  const chosenExperts = data.experts.filter((expert) => selectedExperts.includes(expert.name));
  const chosenKillers = data.killers.filter((expert) => selectedKillers.includes(expert.name));
  const poolCounts = useMemo(() => {
    const map = new Map<number, number>();
    chosenExperts.forEach((expert) =>
      expert.numbers.forEach((num) => map.set(num, (map.get(num) ?? 0) + 1)),
    );
    return map;
  }, [chosenExperts]);
  const collectionThreshold = collectionRule === "all"
    ? chosenExperts.length
    : collectionRule === "majority"
      ? Math.floor(chosenExperts.length / 2) + 1
      : 1;
  const collectionNumbers = Array.from({ length: 35 }, (_, i) => i + 1)
    .filter((num) => chosenExperts.length > 0 && (poolCounts.get(num) ?? 0) >= collectionThreshold);
  const supportGroups = useMemo(
    () => Array.from({ length: chosenExperts.length }, (_, index) => {
      const support = chosenExperts.length - index;
      return {
        support,
        numbers: Array.from({ length: 35 }, (_, i) => i + 1)
          .filter((num) => (poolCounts.get(num) ?? 0) === support),
      };
    }),
    [chosenExperts.length, poolCounts],
  );
  const displayedNumbers = viewMode === "collection" ? collectionNumbers : active.numbers;
  const displayName = viewMode === "collection"
    ? `${chosenExperts.length}位专家合集`
    : active.name;
  const killSources = useMemo(() => {
    const map = new Map<number, string[]>();
    chosenKillers.forEach((expert) =>
      expert.nums.forEach((num) => map.set(num, [...(map.get(num) ?? []), expert.name])),
    );
    return map;
  }, [chosenKillers]);
  const uniqueKills = killSources.size;
  const repeatedKills = [...killSources.entries()].filter(([, sources]) => sources.length > 1);
  const totalKills = chosenKillers.reduce((sum, expert) => sum + expert.nums.length, 0);

  const conflicts = useMemo(
    () => displayedNumbers.filter((n) => killSources.has(n)),
    [displayedNumbers, killSources],
  );
  const repeats = conflicts.filter((n) => (killSources.get(n)?.length ?? 0) > 1);
  const remaining = displayedNumbers.filter((n) => !killSources.has(n));

  const visible = (num: number) => {
    if (filter === "conflict") return displayedNumbers.includes(num) && killSources.has(num);
    if (filter === "repeat") return displayedNumbers.includes(num) && (killSources.get(num)?.length ?? 0) > 1;
    return true;
  };

  const toggleExpert = (name: string) => {
    setSelectedExperts((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
    setViewMode("collection");
    setFilter("all");
  };

  const toggleKiller = (name: string) => {
    setSelectedKillers((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
    setFilter("all");
  };

  const openPasswordDialog = () => {
    setPasswordError("");
    setRefreshPassword("");
    setPasswordOpen(true);
    window.setTimeout(() => passwordInputRef.current?.focus(), 0);
  };

  const refreshData = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!refreshPassword) {
      setPasswordError("请输入刷新密码");
      return;
    }
    setRefreshState("loading");
    setPasswordError("");
    setRefreshMessage("正在读取最新榜单与完整方案…");
    const authHeaders = { "x-refresh-password": refreshPassword };
    try {
      const rankingResponse = await fetch(`/api/refresh?mode=ranking&t=${Date.now()}`, {
        cache: "no-store",
        headers: authHeaders,
      });
      const ranking = await rankingResponse.json();
      if (rankingResponse.status === 401) throw new Error("刷新密码错误");
      if (!rankingResponse.ok) throw new Error(ranking.error || "榜单更新失败");
      if (!Array.isArray(ranking.experts) || !Array.isArray(ranking.killers)) throw new Error("榜单数据格式异常");
      setRefreshMessage("榜单已读取，正在获取13位专家的完整方案…");
      const loadDetail = async (id: string, type: "pool" | "kill") => {
        const response = await fetch(`/api/refresh?mode=detail&id=${id}&issue=${ranking.issue}&type=${type}&t=${Date.now()}`, {
          cache: "no-store",
          headers: authHeaders,
        });
        const detail = await response.json();
        if (!response.ok) throw new Error(detail.error || "完整方案读取失败");
        return detail;
      };
      const poolDetails = await Promise.all(ranking.experts.map((expert: { id: string }) => loadDetail(expert.id, "pool")));
      const killDetails = await Promise.all(ranking.killers.map((expert: { id: string }) => loadDetail(expert.id, "kill")));
      const payload: DashboardData = {
        issue: ranking.issue,
        experts: ranking.experts.map((expert: Expert & { id: string }, index: number) => ({
          name: expert.name, streak: expert.streak, best: expert.best,
          numbers: poolDetails[index].numbers, url: poolDetails[index].url,
        })),
        killers: ranking.killers.map((expert: Killer & { id: string }, index: number) => ({
          name: expert.name, score: expert.score,
          nums: killDetails[index].numbers, url: killDetails[index].url,
        })),
        updatedAt: new Date().toISOString(),
      };
      setData(payload);
      setSelected(0);
      setSelectedExperts(payload.experts.map((expert) => expert.name));
      setSelectedKillers(payload.killers.map((expert) => expert.name));
      setFilter("all");
      setRefreshState("success");
      setRefreshMessage(`已更新：${new Date(payload.updatedAt).toLocaleString("zh-CN", { hour12: false })}`);
      setPasswordOpen(false);
      setRefreshPassword("");
    } catch (error) {
      setRefreshState("error");
      const rawMessage = error instanceof Error ? error.message : "更新失败";
      if (rawMessage === "刷新密码错误") {
        setPasswordError(rawMessage);
        setRefreshMessage("密码验证失败，未执行刷新");
        passwordInputRef.current?.focus();
        return;
      }
      const safeMessage = rawMessage.includes("internal error") ? "源站暂时无法访问，请稍后重试" : rawMessage;
      setRefreshMessage(`${safeMessage}，已保留当前数据`);
    }
  };

  return (
    <main>
      <div className="page-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">EXPERT SIGNAL MATRIX</p>
            <h1>大乐透专家杀号对照</h1>
            <p className="subtitle">自选红球25码专家生成合集，再与8位专家的杀号放在同一张图里看</p>
          </div>
          <div className="refresh-area">
            <div className="period" aria-label="当前期次">
              <span>数据期次</span>
              <strong>{data.issue}</strong>
            </div>
            <button className={`refresh-button ${refreshState}`} onClick={openPasswordDialog} disabled={refreshState === "loading"}>
              <span aria-hidden="true">↻</span>
              {refreshState === "loading" ? "正在更新" : "刷新最新数据"}
            </button>
            <p className="refresh-status" aria-live="polite">{refreshMessage}</p>
          </div>
        </header>

        {passwordOpen && (
          <div
            className="password-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && refreshState !== "loading") setPasswordOpen(false);
            }}
          >
            <section className="password-dialog" role="dialog" aria-modal="true" aria-labelledby="password-title">
              <button
                className="dialog-close"
                type="button"
                aria-label="关闭密码窗口"
                disabled={refreshState === "loading"}
                onClick={() => setPasswordOpen(false)}
              >
                ×
              </button>
              <div className="lock-icon" aria-hidden="true">🔐</div>
              <p className="panel-kicker">PROTECTED REFRESH</p>
              <h2 id="password-title">验证刷新权限</h2>
              <p className="dialog-copy">请输入设置中秘钥 <code>root</code> 对应的密码，验证通过后才会获取最新数据。</p>
              <form onSubmit={refreshData}>
                <label htmlFor="refresh-password">刷新密码</label>
                <input
                  ref={passwordInputRef}
                  id="refresh-password"
                  type="password"
                  value={refreshPassword}
                  disabled={refreshState === "loading"}
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={passwordError ? "password-error" : undefined}
                  onChange={(event) => {
                    setRefreshPassword(event.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                />
                {passwordError && <p className="password-error" id="password-error">{passwordError}</p>}
                <button type="submit" disabled={refreshState === "loading"}>
                  {refreshState === "loading" ? "正在验证并更新…" : "验证并刷新数据"}
                </button>
              </form>
              <small>密码仅用于本次验证，不会保存在此设备。</small>
            </section>
          </div>
        )}

        <section className="summary" aria-label="数据摘要">
          <div className="summary-card"><span>25码专家</span><strong>{data.experts.length}</strong><small>组完整方案</small></div>
          <div className="summary-card"><span>不同杀号</span><strong>{uniqueKills}</strong><small>已选{chosenKillers.length}/{data.killers.length}位 · 共{totalKills}次</small></div>
          <div className="summary-card"><span>重复杀号</span><strong>{repeatedKills.length}</strong><small>{repeatedKills.map(([n]) => String(n).padStart(2, "0")).join(" · ") || "暂无"}</small></div>
          <div className="summary-card accent"><span>当前冲突</span><strong>{conflicts.length}</strong><small>{displayName} · 剩余 {remaining.length} 码</small></div>
        </section>

        <section className="analysis-card">
          <div className="collection-builder">
            <div className="collection-heading">
              <div>
                <p className="panel-kicker">CUSTOM EXPERT COLLECTION</p>
                <h2>自选专家 · 25码方案合集</h2>
                <p>勾选要参考的专家，再选择号码至少被多少位专家纳入。</p>
              </div>
              <div className="collection-actions">
                <button onClick={() => { setSelectedExperts(data.experts.map((expert) => expert.name)); setViewMode("collection"); }}>全选</button>
                <button onClick={() => { setSelectedExperts([]); setViewMode("collection"); }}>清空</button>
              </div>
            </div>
            <div className="expert-checks" aria-label="自选红球25码专家">
              {data.experts.map((expert, index) => {
                const checked = selectedExperts.includes(expert.name);
                return (
                  <label className={checked ? "checked" : ""} key={expert.name}>
                    <input type="checkbox" checked={checked} onChange={() => toggleExpert(expert.name)} />
                    <span className="expert-rank">#{index + 1}</span>
                    <span className="expert-copy">
                      <strong>{expert.name}</strong>
                      <small>{expert.streak}<em>最高 {expert.best} 连红</em></small>
                    </span>
                    <span className="check-mark" aria-hidden="true">{checked ? "✓" : "+"}</span>
                  </label>
                );
              })}
            </div>
            <div className="collection-controls">
              <div className="selection-count">
                <strong>{chosenExperts.length}</strong>
                <span>/ {data.experts.length} 位已选</span>
              </div>
              <div className="rule-buttons" aria-label="合集规则">
                {([
                  ["any", "至少1位"],
                  ["majority", "过半专家"],
                  ["all", "全部专家"],
                ] as [CollectionRule, string][]).map(([rule, label]) => (
                  <button
                    key={rule}
                    className={collectionRule === rule ? "selected" : ""}
                    disabled={chosenExperts.length === 0}
                    onClick={() => { setCollectionRule(rule); setViewMode("collection"); setFilter("all"); }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                className="show-collection"
                disabled={chosenExperts.length === 0}
                onClick={() => { setViewMode("collection"); setFilter("all"); }}
              >
                查看合集（{collectionNumbers.length}码）
              </button>
              <p>{chosenExperts.length > 0 ? `当前门槛：至少 ${collectionThreshold}/${chosenExperts.length} 位专家选中` : "请至少选择1位专家"}</p>
            </div>
          </div>

          <div className="expert-tabs" role="tablist" aria-label="选择红球25码专家">
            {data.experts.map((expert, index) => (
              <button
                key={expert.name}
                role="tab"
                aria-selected={viewMode === "single" && selected === index}
                className={viewMode === "single" && selected === index ? "active" : ""}
                onClick={() => { setSelected(index); setViewMode("single"); setFilter("all"); }}
              >
                <span>{expert.name}</span>
                <small>{expert.streak} · 最高{expert.best}连红</small>
              </button>
            ))}
          </div>

          <div className="analysis-body">
            <div className="matrix-panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">{displayName} · {displayedNumbers.length}码</p>
                  <h2>{viewMode === "collection" ? "合集 × 杀号矩阵" : "号码冲突矩阵"}</h2>
                </div>
                <div className="filters" aria-label="号码筛选">
                  {([
                    ["all", "全部号码"],
                    ["conflict", `冲突 ${conflicts.length}`],
                    ["repeat", `重复杀号 ${repeats.length}`],
                  ] as [Filter, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      className={filter === key ? "selected" : ""}
                      onClick={() => setFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="number-grid" aria-live="polite">
                {Array.from({ length: 35 }, (_, i) => i + 1).map((num) => {
                  const inPool = displayedNumbers.includes(num);
                  const count = killSources.get(num)?.length ?? 0;
                  const status = !inPool ? "outside" : count > 1 ? "repeat" : count === 1 ? "single" : "clear";
                  const sources = killSources.get(num)?.join("、") ?? "无杀号记录";
                  return (
                    <button
                      key={num}
                      className={`ball ${status} ${visible(num) ? "" : "muted"}`}
                      title={`${String(num).padStart(2, "0")}｜${inPool ? "在25码内" : "不在25码内"}｜${sources}`}
                      aria-label={`${num}号，${inPool ? "在当前方案内" : "不在当前方案内"}${viewMode === "collection" ? `，${poolCounts.get(num) ?? 0}位25码专家选中` : ""}，${sources}`}
                    >
                      <span>{String(num).padStart(2, "0")}</span>
                      {inPool && count > 0 && <small>×{count}</small>}
                      {viewMode === "collection" && (poolCounts.get(num) ?? 0) > 0 && (
                        <b className="pool-count">{poolCounts.get(num)}/{chosenExperts.length}</b>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="result-strip">
                <div><strong>{conflicts.length}</strong><span>个入选号码与杀号冲突</span></div>
                <div><strong>{repeats.length}</strong><span>个被2位专家同时杀</span></div>
                <div><strong>{remaining.length}</strong><span>个入选号码未被任何人杀</span></div>
                {viewMode === "single"
                  ? <a href={active.url} target="_blank" rel="noreferrer">查看原方案 ↗</a>
                  : <button className="back-single" onClick={() => setViewMode("single")}>返回单专家</button>}
              </div>
            </div>

            <aside className="insight-panel">
              <div>
                <p className="panel-kicker">图例</p>
                <h2>怎样看颜色</h2>
                <ul className="legend">
                  <li><i className="dot repeat" /><span><strong>重复杀号</strong><small>被当前所选的 2 位及以上专家排除</small></span></li>
                  <li><i className="dot single" /><span><strong>单次杀号</strong><small>被当前所选的 1 位专家排除</small></span></li>
                  <li><i className="dot clear" /><span><strong>保留号码</strong><small>在25码内且未被杀号</small></span></li>
                  <li><i className="dot outside" /><span><strong>方案外号码</strong><small>不在当前25码方案内</small></span></li>
                  {viewMode === "collection" && <li><i className="count-sample"><b>4</b><span>/</span><b>5</b></i><span><strong>专家支持数</strong><small>5位中有4位选中该号码</small></span></li>}
                </ul>
              </div>
              <div className="insight">
                <p className="panel-kicker">当前专家冲突</p>
                <div className="chips">
                  {conflicts.map((n) => (
                    <span className={(killSources.get(n)?.length ?? 0) > 1 ? "hot" : ""} key={n}>
                      {String(n).padStart(2, "0")}
                    </span>
                  ))}
                </div>
                <p>红色号码分歧更集中；白色号码只是“未被当前所选杀号专家杀”，并不代表必然出现。</p>
              </div>
              <div className="callout">
                <strong>重点观察</strong>
                <p>先自选25码专家并选择合集门槛，再查看红色重复杀号。刷新后专家名单、合集和统计都会按最新方案自动重算。</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="kill-section">
          <div className="section-heading">
            <div>
              <p className="panel-kicker">CUSTOM KILL EXPERTS</p>
              <h2>自选杀号专家</h2>
              <p>选择要参与对照的杀号专家，矩阵与全部统计会立即重算。</p>
            </div>
            <div className="killer-actions">
              <span><strong>{chosenKillers.length}</strong> / {data.killers.length} 位已选</span>
              <button onClick={() => setSelectedKillers(data.killers.map((killer) => killer.name))}>全选</button>
              <button onClick={() => setSelectedKillers([])}>清空</button>
            </div>
          </div>
          <div className="killer-grid" aria-label="自选杀号专家">
            {data.killers.map((killer, index) => {
              const checked = selectedKillers.includes(killer.name);
              return (
              <label className={checked ? "checked" : ""} key={killer.name}>
                <input type="checkbox" checked={checked} onChange={() => toggleKiller(killer.name)} />
                <span className="killer-rank">#{index + 1}</span>
                <div className="killer-copy"><h3>{killer.name}</h3><p>{killer.score}</p></div>
                <div className="mini-balls">
                  {killer.nums.map((n) => <span className={(killSources.get(n)?.length ?? 0) > 1 ? "repeat" : ""} key={n}>{String(n).padStart(2, "0")}</span>)}
                </div>
                <span className="killer-check" aria-hidden="true">{checked ? "✓" : "+"}</span>
              </label>
            )})}
          </div>
          {chosenKillers.length === 0 && <p className="killer-empty">当前未选择杀号专家，矩阵中的所有号码都按“未杀号”显示。</p>}
        </section>

        <section className="support-groups support-groups-bottom" aria-labelledby="support-groups-title">
          <div className="support-groups-heading">
            <div>
              <p className="panel-kicker">EXPERT SUPPORT SETS</p>
              <h2 id="support-groups-title">不同专家支持数的号码集合</h2>
            </div>
            <p>按当前已选择的 {chosenExperts.length} 位25码专家统计 · 颜色按已选择的 {chosenKillers.length} 位杀号专家计算</p>
          </div>
          {chosenExperts.length > 0 ? (
            <div className="support-group-list">
              {supportGroups.map(({ support, numbers }) => (
                <article className="support-group" key={support}>
                  <div className="support-label">
                    <strong>{support}</strong>
                    <span>位专家支持</span>
                    <small>{numbers.length} 个号码</small>
                  </div>
                  <div className="support-numbers">
                    {numbers.length > 0 ? numbers.map((num) => {
                      const killCount = killSources.get(num)?.length ?? 0;
                      const killClass = killCount > 1 ? "repeat" : killCount === 1 ? "single" : "clear";
                      return (
                        <span
                          className={killClass}
                          title={`${String(num).padStart(2, "0")}｜${support}位25码专家支持｜${killSources.get(num)?.join("、") ?? "未被所选专家杀号"}`}
                          key={num}
                        >
                          {String(num).padStart(2, "0")}
                          {killCount > 0 && <small>×{killCount}</small>}
                        </span>
                      );
                    }) : <em>暂无号码</em>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="support-empty">请先在上方选择至少 1 位红球25码专家</div>
          )}
        </section>

        <footer>
          <p>数据整理自一起彩公开专家方案，仅用于对照与统计展示，不构成投注建议。</p>
          <a href="https://www.yiqicai.com/ex/dltex_1025" target="_blank" rel="noreferrer">原始榜单 ↗</a>
        </footer>
      </div>
    </main>
  );
}
