import { useCallback, useEffect, useRef, useState } from "react";
import { callback, getEvent } from "./events";
import { fresh, rank, SAVE_KEY, titles, validSession } from "./model";
import type { Outcome, Session } from "./model";
import { HELP, Operation } from "./operation";
import World from "./World";
import { complete, advance, acknowledgePromotion } from "./session";
import type { Hud } from "./World";
import { play, setMute, unlock } from "./audio";
const blank = (): Session => ({
  world: fresh(),
  eventId: "cat",
  phase: "call",
});
function restore(): Session {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    return validSession(value)
      ? { ...value, eventId: getEvent(value.eventId).id }
      : blank();
  } catch {
    return blank();
  }
}
function Phone({ ring = false }: { ring?: boolean }) {
  return (
    <svg
      className={ring ? "phone ringing" : "phone"}
      width="26"
      height="26"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 4 9 3l4 6-3 3c2 3 3 4 6 5l3-3 6 4-1 4c-1 5-9 1-14-4C4 12 1 5 5 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M17 4c4 0 7 3 7 7M17 8c2 0 3 1 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
export default function App() {
  const [session, setSession] = useState<Session>(restore);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hud, setHud] = useState<Hud>({
    time: 0,
    started: false,
    shots: 0,
    pickups: 0,
    goal: false,
  });
  const [reset, setReset] = useState(false);
  const [history, setHistory] = useState(false);
  const [secret, setSecret] = useState("");
  const [storageOk, setStorageOk] = useState(true);
  const transitioning = useRef(false);
  const { world, phase, report } = session;
  const event = getEvent(session.eventId);
  const currentRank = rank(world.count);
  const nextRank = titles.find((t) => t.at > world.count);
  const isPresident = world.count >= 25;
  const selectedResponse = selected === null ? null : event.responses[selected];
  const primaryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(session));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
    setMute(world.muted);
  }, [session, world.muted]);
  useEffect(() => {
    if (phase === "call" && !operation) play("ring");
  }, [phase, operation, session.eventId]);
  useEffect(() => {
    if (phase === "result" || phase === "promotion")
      primaryRef.current?.focus({ preventScroll: true });
  }, [phase]);
  const finish = useCallback(
    (outcome: Outcome) => {
      if (transitioning.current) return;
      transitioning.current = true;
      setOperation(null);
      setSession((s) => complete(s, selected ?? 0, outcome));
      play("crash");
      setTimeout(() => play("win"), 250);
    },
    [selected],
  );
  const deploy = (i: number) => {
    unlock();
    play("siren");
    transitioning.current = false;
    setSelected(i);
    const r = event.responses[i];
    const target: [number, number] =
      r.mechanic === "magnet" ? [820, 525] : event.location;
    setHud({ time: 0, started: false, shots: 0, pickups: 0, goal: false });
    setOperation(new Operation(r.mechanic, r.tool, target));
  };
  const next = () => {
    unlock();
    play("click");
    const s = advance(session);
    setSelected(null);
    setSession(s);
    if (s.phase === "promotion") play("promotion");
  };
  const returnToDesk = () => {
    play("ring");
    setSession(acknowledgePromotion);
  };
  const newGame = () => {
    unlock();
    const s = blank();
    s.world.muted = world.muted;
    setSession(s);
    setOperation(null);
    setSelected(null);
    setReset(false);
    transitioning.current = false;
    play("ring");
  };
  const gossip = () => {
    play("secret");
    setSecret(
      world.count < 3
        ? "“I’m very pleased with my portrait. Please stop touching it.”"
        : world.effects.pigeons
          ? "The pigeon mayor has declined to comment. It has eaten the microphone."
          : "“This administration has created more emergencies than any previous administration.”",
    );
    setTimeout(() => setSecret(""), 6500);
  };
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReset(false);
        setHistory(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    if (!reset && !history) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>("[role=dialog]");
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialog) return;
      const items = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button,a[href],input,[tabindex="0"]',
        ),
      ];
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [reset, history]);
  const act = () => {
    unlock();
    play("click");
    operation?.act();
  };
  return (
    <div className="app">
      <header>
        <a
          className="wordmark"
          href="/"
          onClick={(e) => e.preventDefault()}
          aria-label="The World's Worst Emergency Service"
        >
          <span className="seal">✳</span>
          <span>
            <small>DEPARTMENT OF UNEXPECTED OUTCOMES</small>
            <strong>
              THE WORLD’S WORST
              <br />
              EMERGENCY SERVICE
            </strong>
          </span>
        </a>
        <div className="header-tools">
          <span className="open">
            <i />
            ON DUTY. UNFORTUNATELY.
          </span>
          <button
            className="round-button"
            aria-label={world.muted ? "Unmute sound" : "Mute sound"}
            title={world.muted ? "Unmute sound" : "Mute sound"}
            onClick={() => {
              unlock();
              setSession((s) => ({
                ...s,
                world: { ...s.world, muted: !s.world.muted },
              }));
            }}
          >
            {world.muted ? <span>♪̸</span> : <span>♫</span>}
          </button>
          <button
            className="round-button"
            aria-label="Open case history"
            title="Case history"
            onClick={() => setHistory(true)}
          >
            ≡
          </button>
          <button
            className="round-button"
            aria-label="New game"
            title="New game"
            onClick={() => setReset(true)}
          >
            ↺
          </button>
        </div>
      </header>
      <main>
        <div className="masthead">
          <div>
            <div className="eyebrow">
              BELLWETHER MUNICIPAL DISPATCH <span>EST. THIS MORNING</span>
            </div>
            <h1>
              Please remain <em>mildly concerned.</em>
            </h1>
          </div>
          <div className="career">
            <span>YOUR CURRENT QUALIFICATIONS</span>
            <strong>{currentRank.title}</strong>
            {nextRank && (
              <div className="career-track">
                <i
                  style={{
                    width: `${((world.count - rank(world.count).at) / (nextRank.at - rank(world.count).at)) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="game">
          <section
            className={`world ${operation ? "operating" : ""}`}
            aria-label="The town"
          >
            <div className="camera-strip">
              <span>
                <i />
                TOWN CAMERA 01 · LIVE
              </span>
              <span>
                CONDITION:{" "}
                {world.count > 20
                  ? "NATIONALLY RECOGNIZED"
                  : world.damage > 5
                    ? "HISTORICALLY SIGNIFICANT"
                    : world.count
                      ? "UNDER NEW MANAGEMENT"
                      : "UNREASONABLY PEACEFUL"}
              </span>
            </div>
            <div className="canvas-wrap">
              <World
                world={world}
                event={event}
                operation={operation}
                onFinish={finish}
                onHud={setHud}
                onSecret={gossip}
                celebrate={phase === "promotion"}
              />
              {operation && (
                <div className="operation-strip">
                  <span>
                    {hud.started
                      ? `${Math.max(0, 13 - Math.floor(hud.time))}s REMAINING`
                      : "TOUCH THE TOWN TO BEGIN"}
                  </span>
                  <span>
                    {operation.kind === "magnet"
                      ? `${hud.pickups}/3 CARS COLLECTED`
                      : operation.kind === "timing"
                        ? `${hud.shots}/3 AUTHORIZATIONS`
                        : operation.kind === "rescue"
                          ? `${hud.shots}/3 RESCUES`
                          : operation.kind === "launch"
                            ? `${hud.shots}/2 DELIVERIES`
                            : hud.goal
                              ? "TARGET REACHED · HOLD POSITION"
                              : "FOLLOW THE STRIPED TARGET"}
                  </span>
                </div>
              )}
              {secret && (
                <div className="gossip" role="status">
                  <span>{secret}</span>
                  <button
                    aria-label="Dismiss mayor comment"
                    onClick={() => setSecret("")}
                  >
                    ×
                  </button>
                </div>
              )}
              {phase === "promotion" && (
                <div className={`parade ${isPresident ? "presidential" : ""}`}>
                  <span>OFFICIAL NOTICE FROM THE GOVERNMENT</span>
                  <h2>
                    {isPresident
                      ? "YOU HAVE BEEN ELECTED PRESIDENT."
                      : "EXCEPTIONAL LEADERSHIP."}
                  </h2>
                  <p>
                    {isPresident
                      ? "Approval rating: 103%. Nobody has checked the maths."
                      : "Your record has been reviewed. Somehow, this is a promotion."}
                  </p>
                </div>
              )}
            </div>
            <div className="world-ticker">
              <span className="ticker-label">LOCAL UPDATE</span>
              <p>{callback(world)}</p>
            </div>
            <div className="town-caption">
              <span>
                BELLWETHER · POP. {842 - Math.min(world.damage * 3, 96)}
              </span>
              <button onClick={gossip}>A WORD FROM THE MAYOR ↗</button>
            </div>
          </section>
          <aside
            className="dispatch"
            aria-label="Emergency dispatcher"
            aria-live="polite"
          >
            <div
              className={`dispatch-label ${phase === "result" ? "resolved" : ""}`}
            >
              <span>
                {operation
                  ? "RESPONSE IN PROGRESS"
                  : phase === "result"
                    ? "CASE CLOSED*"
                    : phase === "promotion"
                      ? "CAREER DEVELOPMENT"
                      : "INCOMING EMERGENCY"}
              </span>
              <span>
                NO.{" "}
                {String(
                  phase === "result" ? world.count : world.count + 1,
                ).padStart(3, "0")}
              </span>
            </div>
            {phase === "call" && !operation && (
              <div className="call-content" key={event.id}>
                <div className="call-status">
                  <Phone ring />
                  <span>LINE CONNECTED</span>
                  <span className="waveform">▂ ▆ ▃ ▇ ▄ ▂</span>
                </div>
                <div className="caller">{event.caller}</div>
                <h2>{event.title}</h2>
                <p className="dialogue">{event.line}</p>
                <div className="response-heading">
                  <span>HOW SHALL WE MAKE THIS WORSE?</span>
                  <span>03 OPTIONS</span>
                </div>
                <div className="responses">
                  {event.responses.map((r, i) => (
                    <button key={r.label} onClick={() => deploy(i)}>
                      <span className="response-number">0{i + 1}</span>
                      <span>{r.label}</span>
                      <b>↗</b>
                    </button>
                  ))}
                </div>
                <p className="fineprint">
                  EVERY DECISION CHANGES THE TOWN.
                  <br />
                  NOT EVERY CHANGE IS AN IMPROVEMENT.
                </p>
              </div>
            )}
            {operation && selectedResponse && (
              <div className="operation-content">
                <span className="operation-id">
                  FIELD OPERATION · {selectedResponse.mechanic.toUpperCase()}
                </span>
                <h2>{HELP[selectedResponse.mechanic].title}</h2>
                <p className="dialogue">
                  {HELP[selectedResponse.mechanic].body}
                </p>
                <div className="deployment-note">
                  <span>YOU AUTHORIZED</span>
                  <strong>{selectedResponse.label}</strong>
                </div>
                <div className="operation-progress">
                  <i style={{ width: `${(hud.time / 13) * 100}%` }} />
                </div>
                <p className="operation-readout">
                  {hud.started
                    ? "THE OPERATION IS NOW YOUR RESPONSIBILITY."
                    : "THE TOWN IS INTERACTIVE. YOUR MOUSE OR FINGER IS THE RESPONSE."}
                </p>
                <button
                  className="primary"
                  disabled={
                    operation.finished ||
                    (operation.kind === "launch" ? 2 : 3) <= hud.shots
                  }
                  onClick={act}
                >
                  {HELP[operation.kind].action.toUpperCase()} <span>↵</span>
                </button>
                <p className="keyboard">{HELP[operation.kind].keyboard}</p>
                <p className="fineprint">
                  FAILURE STILL ADVANCES THE STORY.
                  <br />
                  THE GOVERNMENT BELIEVES IN YOU.
                </p>
              </div>
            )}
            {phase === "result" && report && (
              <div className="result-content">
                <div className="stamp">
                  SUCCESSFULLY
                  <br />
                  DEALT WITH*
                </div>
                <span className="caller">OFFICIAL AFTER-ACTION REPORT</span>
                <h2>
                  {report.score > 65
                    ? "Excellent work. Allegedly."
                    : "You did something. Well done."}
                </h2>
                <p className="result-story">{report.text}</p>
                <div className="assessment">
                  <span>
                    OPERATIONAL ACCURACY{" "}
                    <strong>{Math.round(report.score)}%</strong>
                  </span>
                  <p>{report.assessment}</p>
                </div>
                <button className="primary" ref={primaryRef} onClick={next}>
                  ANSWER NEXT CALL <span>→</span>
                </button>
                <p className="fineprint">
                  *“DEALT WITH” IS A PROVISIONAL LEGAL TERM.
                </p>
              </div>
            )}
            {phase === "promotion" && (
              <div className="promotion-content">
                <span className="laurel">✷ ✳ ✷</span>
                <span className="caller">FORM 23-B · UPWARD FAILURE</span>
                <h2>
                  {isPresident
                    ? "The nation has made its choice."
                    : "Your career is going alarmingly well."}
                </h2>
                <p className="dialogue">
                  {isPresident
                    ? "You turned a cat rescue into a national incident. The public calls that experience."
                    : "The government has mistaken your growing number of emergencies for increasing responsibility."}
                </p>
                <div className="new-title">
                  <span>YOUR NEW POSITION</span>
                  <strong>{currentRank.title}</strong>
                </div>
                <button
                  className="primary"
                  ref={primaryRef}
                  onClick={returnToDesk}
                >
                  {isPresident
                    ? "TAKE THE PRESIDENTIAL CALL"
                    : "RETURN TO YOUR DESK"}{" "}
                  <span>→</span>
                </button>
                <p className="fineprint">THE PHONE IS STILL RINGING.</p>
              </div>
            )}
            <div className="dispatch-bottom">
              <span>
                {String(world.count).padStart(3, "0")} CASES “RESOLVED”
              </span>
              <span>COMPLAINTS: CLASSIFIED</span>
            </div>
          </aside>
        </div>
        <footer>
          <span>
            A PUBLIC SERVICE DISASTER BY{" "}
            <a href="https://kapoorjay.com" target="_blank" rel="noreferrer">
              JAY KAPOOR ↗
            </a>
          </span>
          <span>
            {storageOk
              ? "YOUR TOWN SAVES AUTOMATICALLY."
              : "STORAGE UNAVAILABLE · THIS SESSION WILL NOT SAVE."}
          </span>
        </footer>
      </main>
      {(reset || history) && (
        <div
          className="modal-shade"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setReset(false);
              setHistory(false);
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="modal-close"
              aria-label="Close dialog"
              autoFocus
              onClick={() => {
                setReset(false);
                setHistory(false);
              }}
            >
              ×
            </button>
            <span className="eyebrow">DEPARTMENTAL RECORDS</span>
            <h2 id="modal-title">
              {reset ? "Start a fresh disaster?" : "Your permanent record."}
            </h2>
            {reset ? (
              <>
                <p>
                  Your town and case history will be replaced. The mayor will
                  pretend not to recognize you.
                </p>
                <div className="modal-buttons">
                  <button onClick={() => setReset(false)}>KEEP MY TOWN</button>
                  <button className="primary" onClick={newGame}>
                    NEW GAME →
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  {world.count} emergencies. {currentRank.title}. An outstanding
                  misunderstanding.
                </p>
                <ol className="history">
                  {world.history.length ? (
                    [...world.history].reverse().map((h, i) => (
                      <li key={i}>
                        <span>{getEvent(h.event).title}</span>
                        <strong>{h.response}</strong>
                        <small>
                          Accuracy {h.score}% · Government assessment: approved
                        </small>
                      </li>
                    ))
                  ) : (
                    <li>Your first bad decision awaits.</li>
                  )}
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
