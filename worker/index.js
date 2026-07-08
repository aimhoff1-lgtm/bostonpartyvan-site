export default {
  async fetch(request, env) {
    return new Response(
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Temporarily Unavailable</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0b1020;
        color: #f8fafc;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          linear-gradient(135deg, rgba(34, 211, 238, 0.16), transparent 34%),
          radial-gradient(circle at 70% 30%, rgba(244, 63, 94, 0.18), transparent 32%),
          #0b1020;
      }

      main {
        width: min(100%, 620px);
        text-align: center;
      }

      p {
        margin: 0;
        color: #cbd5e1;
        font-size: clamp(1rem, 2vw, 1.15rem);
        line-height: 1.6;
      }

      h1 {
        margin: 0 0 14px;
        font-size: clamp(2.1rem, 7vw, 4.2rem);
        line-height: 0.95;
        letter-spacing: 0;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Temporarily unavailable</h1>
      <p>This site is offline for now.</p>
    </main>
  </body>
</html>`,
      {
        status: 503,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "retry-after": "3600",
          "x-robots-tag": "noindex, nofollow",
        },
      },
    );
  },
};
