/**
 * In-page synthetic drag perf — avoids Playwright mouse scheduling skew.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const URL = process.env.PERF_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--force-device-scale-factor=1"],
  });
  const page = await (await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })).newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".carousel-stage", { timeout: 15000 });
  await page.locator(".carousel-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Warm
  await page.evaluate(async () => {
    const stage = document.querySelector(".carousel-stage");
    if (!stage) return;
    stage.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: 700,
        clientY: 400,
        pointerId: 1,
        pointerType: "mouse",
      }),
    );
    for (let i = 0; i < 5; i++) {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          clientX: 700 - i * 10,
          clientY: 400,
          pointerId: 1,
          pointerType: "mouse",
        }),
      );
    }
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        clientX: 650,
        clientY: 400,
        pointerId: 1,
        pointerType: "mouse",
      }),
    );
  });
  await page.waitForTimeout(700);

  await cdp.send("Performance.disable");
  await cdp.send("Performance.enable");
  const before = await cdp.send("Performance.getMetrics");
  const b = Object.fromEntries(before.metrics.map((m) => [m.name, m.value]));

  const result = await page.evaluate(async () => {
    const stage = document.querySelector(".carousel-stage");
    if (!stage) throw new Error("no stage");
    const rect = stage.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const x0 = rect.left + rect.width * 0.55;

    const frames = [];
    const longTasks = [];
    let last = performance.now();
    let sampling = true;
    const raf = (t) => {
      if (!sampling) return;
      frames.push(t - last);
      last = t;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    let obs;
    try {
      obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) longTasks.push(e.duration);
      });
      obs.observe({ type: "longtask", buffered: false });
    } catch {
      /* */
    }

    const down = new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      clientX: x0,
      clientY: y,
      pointerId: 1,
      pointerType: "mouse",
    });
    stage.dispatchEvent(down);

    // Drive ~90 frames of drag synced to rAF (true display cadence)
    await new Promise((resolve) => {
      let i = 0;
      const n = 90;
      const step = (t) => {
        i += 1;
        const u = i / n;
        const x = x0 - Math.sin(u * Math.PI * 2) * 220;
        window.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerId: 1,
            pointerType: "mouse",
          }),
        );
        if (i < n) requestAnimationFrame(step);
        else resolve(t);
      };
      requestAnimationFrame(step);
    });

    window.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        clientX: x0,
        clientY: y,
        pointerId: 1,
        pointerType: "mouse",
      }),
    );

    // sample a few more frames after release
    await new Promise((r) => setTimeout(r, 200));
    sampling = false;
    obs?.disconnect();

    const body = frames.slice(2, -2);
    const avg = body.reduce((a, b) => a + b, 0) / Math.max(body.length, 1);
    return {
      frameCount: body.length,
      avgFrameMs: Number(avg.toFixed(3)),
      avgFps: Number((1000 / avg).toFixed(2)),
      droppedBelow58fps: body.filter((d) => d > 1000 / 58).length,
      droppedBelow28fps: body.filter((d) => d > 1000 / 28).length,
      p95FrameMs: Number(
        body.slice().sort((a, b) => a - b)[
          Math.floor(body.length * 0.95)
        ]?.toFixed(3) ?? 0,
      ),
      worstFrameMs: Number(Math.max(0, ...body).toFixed(3)),
      longTasks: longTasks.length,
      longTaskMaxMs: Number(Math.max(0, ...longTasks, 0).toFixed(3)),
      longTaskTotalMs: Number(
        longTasks.reduce((a, b) => a + b, 0).toFixed(3),
      ),
    };
  });

  const after = await cdp.send("Performance.getMetrics");
  const a = Object.fromEntries(after.metrics.map((m) => [m.name, m.value]));

  const report = {
    method: "in-page rAF-synced pointermove (no Playwright mouse skew)",
    pagePerf: result,
    cdpDelta: {
      LayoutCount: (a.LayoutCount ?? 0) - (b.LayoutCount ?? 0),
      RecalcStyleCount: (a.RecalcStyleCount ?? 0) - (b.RecalcStyleCount ?? 0),
      LayoutDuration: (a.LayoutDuration ?? 0) - (b.LayoutDuration ?? 0),
      RecalcStyleDuration:
        (a.RecalcStyleDuration ?? 0) - (b.RecalcStyleDuration ?? 0),
      ScriptDuration: (a.ScriptDuration ?? 0) - (b.ScriptDuration ?? 0),
      TaskDuration: (a.TaskDuration ?? 0) - (b.TaskDuration ?? 0),
    },
  };

  writeFileSync(
    "scripts/perf-carousel-drag-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
