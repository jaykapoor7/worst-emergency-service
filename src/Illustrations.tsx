export function Phone({ ring = false }: { ring?: boolean }) {
  return (
    <svg
      className={`phone-art ${ring ? "ringing" : ""}`}
      viewBox="0 0 142 96"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M110 37c29-8 23 24 12 17-13-10 19-15 14 0s-26-3-14-5c20-4 16 18 3 13-17-8 13-11 13 2s-19-1-14-2c13-4 11 14 2 15"
        stroke="#52624a"
        strokeWidth="2"
      />
      <path
        d="m29 36-12 38q-2 8 9 8h72q11 0 8-9L92 36"
        fill="#c66046"
        stroke="#3f5140"
        strokeWidth="2.5"
      />
      <path d="m24 62 75 1 5 12H20z" fill="#b14d39" />
      <path
        d="M21 28q36-23 77 0"
        stroke="#3f5140"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        className="handset"
        d="M21 26q36-23 77 0"
        stroke="#d76e4d"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M30 17q27-11 56 0"
        stroke="#ef9c71"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle
        cx="61"
        cy="56"
        r="20"
        fill="#eccb8a"
        stroke="#43513e"
        strokeWidth="2"
      />
      <circle
        cx="61"
        cy="56"
        r="9"
        fill="#bc7754"
        stroke="#43513e"
        strokeWidth="1.5"
      />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <circle
            key={i}
            cx={61 + Math.cos(a) * 14}
            cy={56 + Math.sin(a) * 14}
            r="3"
            fill="#a57f54"
          />
        );
      })}
      <path
        d="M25 84v3m73-3v3"
        stroke="#48553e"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {ring && (
        <g
          className="ring-marks"
          stroke="#ce704a"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="m4 13 7 5M2 28h8m104-14-8 5m12 7-8 2" />
        </g>
      )}
    </svg>
  );
}
export function Seal() {
  return (
    <svg className="civic-seal" viewBox="0 0 70 70" aria-hidden="true">
      <circle cx="35" cy="35" r="31" fill="#d26749" />
      <circle
        cx="35"
        cy="35"
        r="26"
        fill="none"
        stroke="#f5e5b9"
        strokeWidth="1"
        strokeDasharray="1 3"
      />
      <path d="m19 31 16-12 16 12H19Zm4 3h24v17H23z" fill="#f5e5b9" />
      <path
        d="M28 35v16m14-16v16m-7-16v16"
        stroke="#bc5c41"
        strokeWidth="2.5"
      />
      <path
        d="M17 54h36M22 58h26"
        stroke="#f5e5b9"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="m35 9 2 4 5 1-4 3 1 4-4-2-4 2 1-4-4-3 5-1z" fill="#f5e5b9" />
    </svg>
  );
}
export function Doodle({ tool }: { tool: string }) {
  return (
    <svg
      className="response-doodle"
      viewBox="0 0 54 46"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {tool === "dinosaur" ? (
          <>
            <path d="M8 27q18-12 24 2l6-19 10 2v6l-7 1-4 16H15L4 21m13 13-1 7m14-7 3 7" />
            <circle cx="44" cy="13" r="1" fill="currentColor" />
          </>
        ) : tool === "magnet" ? (
          <>
            <path d="M12 8v18q0 17 14 17t14-17V8H29v18q0 7-3 7t-3-7V8zM12 17h11m6 0h11" />
            <path d="m6 22-4-4m45 4 4-4M7 32H2m44 0h6" />
          </>
        ) : tool === "helicopter" || tool === "firefighter" ? (
          <>
            <path d="M17 21q5-11 21-4 14 10 1 17H17l-5-8H4V15m25 1V8M11 7h36M20 34l-3 5h26l-4-5M35 17v10h9" />
          </>
        ) : tool === "stamp" || tool === "demolition" ? (
          <>
            <path d="M8 32h38v9H8zM17 32l3-12h14l3 12M21 19V9q6-7 12 0v10" />
            <path d="m8 22-5-4m42 4 5-4M5 29H1m47 0h5" />
          </>
        ) : tool === "truck" || tool === "car" ? (
          <>
            <path d="M5 19h29v17H5zm29 6h9l6 7v4H34M13 18V9h15v9" />
            <circle cx="14" cy="36" r="5" />
            <circle cx="41" cy="36" r="5" />
          </>
        ) : tool === "boat" ? (
          <>
            <path d="M3 30h47l-9 11H12zM25 29V4l18 21H25M10 43l8-1 8 1 8-1 8 1" />
          </>
        ) : (
          <>
            <path d="m8 16 20-9 18 9v23H8zM8 16l20 8 18-8M28 24v15M17 12l20 9v9" />
            <path d="m14 5-3-4m31 4 3-4" />
          </>
        )}
      </g>
    </svg>
  );
}
export function RankBadge() {
  return (
    <svg className="rank-badge" viewBox="0 0 48 58" aria-hidden="true">
      <path
        d="m13 31-4 24 13-7 5 8 5-25"
        fill="#c5764f"
        stroke="#6d7957"
        strokeWidth="1.5"
      />
      <path
        d="m31 30 8 20-12-4"
        fill="#d99763"
        stroke="#6d7957"
        strokeWidth="1.5"
      />
      <path
        d="m24 2 6 4 8-1 1 8 6 6-5 7v8l-8 2-8 6-7-6-9-2 1-8-5-7 6-6 1-8 8 1z"
        fill="#d7b56d"
        stroke="#7c8259"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="21" r="12" fill="#e8cf8b" stroke="#8e9166" />
      <path d="m24 12 3 6 7 1-5 4 1 7-6-3-6 3 1-7-5-4 7-1z" fill="#a48e55" />
    </svg>
  );
}
