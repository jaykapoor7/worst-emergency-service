import { useCallback, useEffect, useRef, useState } from "react";
import { callback, getEvent } from "./events";
import { fresh, rank, SAVE_KEY, titles, validSession } from "./model";
import type { Outcome, Session } from "./model";
import { HELP, Operation } from "./operation";
import World from "./World";
import {
  Phone,
  Seal,
  Doodle,
  RankBadge,
  CallerPortrait,
} from "./Illustrations";
import { complete, advance, acknowledgePromotion } from "./session";
import type { Hud } from "./World";
import { play, setMute, unlock } from "./audio";
import ImpactLens from "./ImpactLens";
const changeLabels: Record<string, string> = {
  dinosaur: "A dinosaur lives here now",
  flood: "The water stayed",
  pigeons: "Pigeons have claimed this place",
  alien: "Visitors have landed",
  fire: "The fire brigade is still here",
  band: "The band refuses to leave",
  magnet: "The cars are still stuck together",
  moon: "The moon is now a local problem",
  wind: "The weather took a turn",
  ducks: "Ducks have moved in",
  bureaucracy: "A new law is in effect",
  crater: "A hole in the town remains",
};
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
  const caseChanges = world.evidence.filter((mark) => Math.floor(mark.id / 10) === world.count);
  const latestChange = caseChanges[0];
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
    transitioning.current = false;
    const r = event.responses[i];
    if (r.mechanic === "timing" && r.tool === "stamp") {
      play("stamp");
      setSession((s) => complete(s, i, { score: 100, x: event.location[0], y: event.location[1], collisions: 0 }));
      return;
    }
    play("siren");
    setSelected(i);
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
  return (
    <div className="app">
      <header>
        <div
          className="wordmark"
          aria-label="The World's Worst Emergency Service"
        >
          <Seal />
          <span>
            <small>DEPARTMENT OF UNEXPECTED OUTCOMES</small>
            <strong>
              THE WORLD’S WORST
              <br />
              EMERGENCY SERVICE
            </strong>
          </span>
        </div>
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
            <RankBadge />
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
            className={`world ${operation ? "operating" : ""} ${phase === "result" ? "revealing" : ""}`}
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
                impact={phase === "result" && latestChange ? latestChange : undefined}
              />
              {operation && (
                <div className="field-help">
                  {operation.kind === "steer"
                    ? "DRAG TO THE TARGET · RELEASE TO COMMIT"
                    : operation.kind === "magnet"
                      ? "SWEEP THROUGH THE CARS · RELEASE TO COMMIT"
                      : operation.kind === "timing"
                        ? "TAP TO PLACE THE CHARGE"
                        : "TAP A SPOT IN THE TOWN"}
                </div>
              )}
              {operation && (
                <div className="operation-strip">
                  <span>
                    {hud.started
                      ? "YOUR ACTION CHANGES THIS SPOT"
                      : "THE TOWN IS YOUR CONTROL"}
                  </span>
                  <span>
                    {operation.kind === "magnet"
                      ? `${hud.pickups}/3 CARS COLLECTED`
                      : operation.kind === "steer"
                        ? "DRAG · RELEASE"
                        : "TAP ONCE"}
                  </span>
                </div>
              )}
              {phase === "result" && latestChange && (
                <div
                  className={`impact-marker ${latestChange.y > 420 ? "low" : ""}`}
                  style={{ left: `${latestChange.x / 10}%`, top: `${latestChange.y / 6.4}%` }}
                  role="status"
                >
                  <span>{changeLabels[latestChange.kind]}</span>
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
              <p>{phase === "result" && latestChange ? changeLabels[latestChange.kind] + ". " + callback(world) : callback(world)}</p>
              {phase === "call" && !operation && (
                <button className="call-shortcut" onClick={() => document.querySelector(".dispatch")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  ANSWER CALL ↓
                </button>
              )}
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
                <div className="caller-scene">
                  <CallerPortrait seed={event.id} />
                  <div>
                    <div className="caller">{event.caller}</div>
                    <span className="caller-caption">LIVE FROM THE SCENE</span>
                  </div>
                </div>
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
                      <Doodle tool={r.tool} />
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
                <p className="operation-readout">
                  {hud.started
                    ? "The result will happen where you act."
                    : "Touch the town to carry this out."}
                </p>
                <p className="keyboard">{HELP[operation.kind].keyboard}</p>
              </div>
            )}
            {phase === "result" && report && (
              <div className="result-content">
                {latestChange && (
                  <ImpactLens x={latestChange.x} y={latestChange.y} label={changeLabels[latestChange.kind]} />
                )}
                <span className="caller">OFFICIAL AFTER-ACTION REPORT</span>
                <h2>
                  {report.score > 65
                    ? "Excellent work. Allegedly."
                    : "You did something. Well done."}
                </h2>
                <p className="result-story">{report.text}</p>
                <div className="aftermath">
                  <span>PERMANENTLY ADDED TO THE TOWN</span>
                  <ul>
                    {caseChanges.map((change) => (
                      <li key={change.id}>{changeLabels[change.kind]}</li>
                    ))}
                  </ul>
                  <small>PLACEMENT {Math.round(report.score)}% · {report.assessment}</small>
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
                <span className="laurel">
                  <RankBadge />
                </span>
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
