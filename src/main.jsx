import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Sparkles } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, Menu, MousePointer2, X } from "lucide-react";
import * as THREE from "three";
import "./styles.css";

const TECH = [
  ["React", "RE", "#61dafb"],
  ["React Native", "RN", "#61dafb"],
  ["Node.js", "JS", "#8cc84b"],
  ["GitHub", "GH", "#ffffff"],
  ["Firebase", "FB", "#ffca28"],
  ["Vercel", "▲", "#ffffff"],
  ["Docker", "DK", "#2496ed"],
  ["Figma", "FG", "#f24e1e"]
];

const NAV = ["About", "Skills", "Projects", "Experience", "Contact"];

function Globe() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.085;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1.58, 64, 64]} />
        <meshStandardMaterial color="#07121f" roughness={0.72} metalness={0.18} emissive="#062542" emissiveIntensity={0.22} />
      </mesh>
      <mesh scale={1.015}>
        <sphereGeometry args={[1.58, 64, 64]} />
        <meshBasicMaterial color="#45bfff" wireframe transparent opacity={0.10} />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[1.58, 64, 64]} />
        <meshBasicMaterial color="#4bbcff" transparent opacity={0.055} side={THREE.BackSide} />
      </mesh>
      <pointLight position={[0.7, 1.8, 2.2]} intensity={3.5} color="#9cddff" distance={7} />
    </group>
  );
}

function Asteroid({ index, item, mode }) {
  const ref = useRef();
  const base = useMemo(() => {
    const angle = (index / TECH.length) * Math.PI * 2;
    return {
      angle,
      radius: 2.15 + (index % 3) * 0.14,
      y: Math.sin(index * 1.8) * 0.36,
      z: Math.cos(index * 1.4) * 0.15
    };
  }, [index]);

  const exploded = useMemo(() => {
    const a = base.angle;
    return [
      Math.cos(a) * (4.0 + (index % 2) * 0.7),
      Math.sin(index * 1.7) * 2.4,
      Math.sin(a) * (3.2 + (index % 3) * 0.5)
    ];
  }, [base.angle, index]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const orbit = base.angle + t * 0.12;
    const target = mode === "exploded"
      ? exploded
      : [Math.cos(orbit) * base.radius, base.y + Math.sin(t * 0.5 + index) * 0.06, Math.sin(orbit) * base.radius];
    const ease = 1 - Math.pow(0.0008, delta);
    ref.current.position.lerp(new THREE.Vector3(...target), ease);
    ref.current.rotation.x += delta * (0.22 + index * 0.01);
    ref.current.rotation.y += delta * 0.3;
    ref.current.rotation.z += delta * 0.16;
  });

  return (
    <Float speed={0.6 + index * 0.03} rotationIntensity={0.12} floatIntensity={0.12}>
      <group ref={ref}>
        <mesh>
          <icosahedronGeometry args={[0.22 + (index % 2) * 0.04, 1]} />
          <meshStandardMaterial color="#111b28" roughness={0.8} metalness={0.28} emissive="#07101b" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.225]}>
          <planeGeometry args={[0.30, 0.30]} />
          <meshBasicMaterial transparent opacity={0.98} color={item[2]} />
        </mesh>
        <sprite scale={[0.22, 0.22, 1]} position={[0, 0, 0.245]}>
          <spriteMaterial color="#07101a" transparent opacity={0.98} />
        </sprite>
      </group>
    </Float>
  );
}

function OrbitRing({ exploded }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.08;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.15, 0.12, 0]}>
      <torusGeometry args={[2.18, 0.012, 8, 160]} />
      <meshBasicMaterial color="#51c8ff" transparent opacity={exploded ? 0.04 : 0.32} />
    </mesh>
  );
}

function Scene({ mode, onActivate }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 7.3], fov: 44 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#05070c", 7, 15]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 5, 6]} intensity={2.1} color="#d8f2ff" />
      <Stars radius={18} depth={12} count={1200} factor={1.2} saturation={0} fade speed={0.25} />
      <Sparkles count={90} scale={[10, 7, 10]} size={1.1} speed={0.18} opacity={0.42} color="#7bd8ff" />
      <Globe />
      <OrbitRing exploded={mode === "exploded"} />
      {TECH.map((item, i) => <Asteroid key={item[0]} index={i} item={item} mode={mode} />)}
      <mesh onClick={onActivate}>
        <sphereGeometry args={[1.78, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} minPolarAngle={Math.PI * 0.35} maxPolarAngle={Math.PI * 0.65} />
    </Canvas>
  );
}

function App() {
  const [mode, setMode] = useState("idle");
  const [menu, setMenu] = useState(false);
  const timer = useRef();

  const activate = () => {
    setMode("exploded");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMode("reassembling"), 8000);
    setTimeout(() => setMode("idle"), 10000);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <main className="site">
      <header className="nav">
        <a className="brand" href="#top"><span>&lt;/&gt;</span> DAVID<span className="dot">.</span></a>
        <button className="menu-btn" onClick={() => setMenu(v => !v)} aria-label="Toggle navigation">
          {menu ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menu ? "nav-links open" : "nav-links"}>
          {NAV.map(n => <a key={n} href={`#${n.toLowerCase()}`} onClick={() => setMenu(false)}>{n}</a>)}
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-copy">
          <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="eyebrow">FULL STACK DEVELOPER · INDIA</motion.p>
          <motion.h1 initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:.08}}>Building digital<br/><em>worlds</em> that move.</motion.h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.18}} className="sub">
            Interactive web experiences engineered with modern frontend, backend and 3D technologies.
          </motion.p>
          <div className="hero-actions">
            <a href="#projects" className="primary">View projects <ArrowUpRight size={17}/></a>
            <button className="ghost" onClick={activate}><MousePointer2 size={16}/> Explore globe</button>
          </div>
        </div>

        <div className={`globe-wrap ${mode}`}>
          <Scene mode={mode === "reassembling" ? "idle" : mode} onActivate={activate}/>
          <div className="state-pill">
            <span className="pulse"></span>
            {mode === "idle" && "Orbiting · idle"}
            {mode === "exploded" && "Navigation unlocked"}
            {mode === "reassembling" && "Reassembling orbit"}
          </div>
          <AnimatePresence>
            {mode !== "idle" && (
              <motion.div className="state-hint" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                {mode === "exploded" ? "The belt scattered. Explore a section below." : "Pulling every piece back into orbit…"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mobile-scroll"><ArrowDown size={15}/> Scroll to explore</div>
      </section>

      <section className="quick-links" aria-label="Portfolio sections">
        {NAV.map((n, i) => (
          <a key={n} href={`#${n.toLowerCase()}`} className={`quick-card q${i}`}>
            <span>0{i+1}</span><strong>{n}</strong><ArrowUpRight size={15}/>
          </a>
        ))}
      </section>

      <section id="about" className="content-section">
        <p className="section-kicker">01 · ABOUT</p>
        <h2>Interfaces with a pulse.</h2>
        <p>I turn ideas into fast, responsive products — blending clean engineering with motion, 3D interaction and thoughtful visual systems.</p>
      </section>

      <section id="skills" className="content-section">
        <p className="section-kicker">02 · SKILLS</p>
        <h2>A practical modern stack.</h2>
        <div className="skill-grid">{TECH.map(t => <div className="skill" key={t[0]}><b style={{color:t[2]}}>{t[1]}</b><span>{t[0]}</span></div>)}</div>
      </section>

      <section id="projects" className="content-section">
        <p className="section-kicker">03 · PROJECTS</p>
        <h2>Selected work.</h2>
        <div className="project-card"><div><span className="tag">01 · INTERACTIVE</span><h3>Globe Portfolio</h3><p>WebGL-driven portfolio experience with animated navigation and performance-first motion.</p></div><ArrowUpRight/></div>
        <div className="project-card"><div><span className="tag">02 · AUTOMATION</span><h3>Workflow Automation</h3><p>Browser automation that turns repetitive data-entry workflows into reliable one-click actions.</p></div><ArrowUpRight/></div>
      </section>

      <section id="experience" className="content-section">
        <p className="section-kicker">04 · EXPERIENCE</p>
        <h2>Engineering with curiosity.</h2>
        <div className="timeline"><span>NOW</span><p>Full-stack development · frontend systems · automation · interactive experiences</p></div>
      </section>

      <section id="contact" className="content-section contact">
        <p className="section-kicker">05 · CONTACT</p>
        <h2>Let's build something<br/><em>memorable.</em></h2>
        <a className="primary" href="mailto:hello@example.com"><Mail size={17}/> Start a conversation</a>
        <div className="socials"><a href="#"><Github/></a><a href="#"><Linkedin/></a><a href="#"><Mail/></a></div>
      </section>

      <footer><span>© 2026 DAVID.</span><span>Designed in orbit · Built for 60 FPS</span></footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
