"use client";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  BlurFilter,
  TextStyle,
  BLEND_MODES,
  Texture,
  BaseTexture,
} from "pixi.js";
import { Stage, Container, Sprite, Text, ParticleContainer } from "@pixi/react";
import coin from "@/app/_assets/images/coin.png";
import specialCoin from "@/app/_assets/images/fire.png";
import Stats from "stats.js";

interface CoinPosition {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

// Add new interface for special particle
interface SpecialParticle {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  active: boolean;
}

const CoinsFireworkPixie = () => {
  const blurFilter = useMemo(() => new BlurFilter(2), []);
  const STAGE_WIDTH = 500;
  const STAGE_HEIGHT = 900;
  const COIN_SPEED = 100;
  const GRAVITY = 3;
  const COINS_PER_THROW = 5;
  const MAX_COINS = 1000;
  const SPECIAL_PARTICLE_CHANCE = 0.5; // 10% chance to appear
  const SPECIAL_PARTICLE_SPEED = 20; // Slower speed
  const SPECIAL_PARTICLE_SCALE = 2; // Bigger size

  // Create shared texture
  const sharedTexture = useMemo(() => {
    const baseTexture = new BaseTexture(coin.src);
    return new Texture(baseTexture);
  }, []);

  // Add new shared texture for special particle
  const specialTexture = useMemo(() => {
    const baseTexture = new BaseTexture(specialCoin.src);
    return new Texture(baseTexture);
  }, []);

  const lastTime = useRef(performance.now());
  const [coinPositions, setCoinPositions] = useState<CoinPosition[]>([]);
  const [nextCoinId, setNextCoinId] = useState(0);

  // Add state for special particle
  const [specialParticle, setSpecialParticle] = useState<SpecialParticle>({
    id: -1,
    x: 0,
    y: 0,
    speedX: 0,
    speedY: 0,
    rotation: 0,
    rotationSpeed: 0,
    active: false,
  });

  // ParticleContainer options for GPU optimization
  const particleContainerProps = useMemo(
    () => ({
      maxSize: MAX_COINS,
      properties: {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true,
      },
      batchSize: 512, // Optimize batch size
      autoResize: true,
    }),
    [],
  );

  // Stage options for GPU optimization
  const stageOptions = useMemo(
    () => ({
      backgroundAlpha: 0,
      antialias: false,
      autoDensity: true,
      useContextAlpha: true,
      powerPreference: "high-performance" as WebGLPowerPreference,
      clearBeforeRender: true,
    }),
    [],
  );

  // Memoize sprite props to prevent unnecessary updates
  const spriteProps = useMemo(
    () => ({
      anchor: 0.5,
      scale: 0.5,
      width: 35,
      height: 35,
      blendMode: BLEND_MODES.NORMAL,
    }),
    [],
  );

  // Modify createNewCoins to potentially spawn special particle
  const createNewCoins = useCallback(() => {
    // Chance to create special particle
    // if (!specialParticle.active && Math.random() < SPECIAL_PARTICLE_CHANCE) {
    //   setSpecialParticle({
    //     id: Date.now(),
    //     x: STAGE_WIDTH / 2 + (Math.random() - 0.5) * STAGE_WIDTH * 0.8,
    //     y: STAGE_HEIGHT + 50,
    //     speedX: (Math.random() - 0.5) * SPECIAL_PARTICLE_SPEED * 0.3,
    //     speedY: -SPECIAL_PARTICLE_SPEED - Math.random() * 2,
    //     rotation: Math.random() * Math.PI * 0.5,
    //     rotationSpeed: (Math.random() - 0.5) * 0.02,
    //     active: true,
    //   });
    // }

    const newCoins: CoinPosition[] = Array(COINS_PER_THROW)
      .fill(null)
      .map(() => {
        const targetY = Math.random() * (STAGE_HEIGHT * 0.8);
        const distanceToTarget = STAGE_HEIGHT + 50 - targetY;
        const requiredSpeed = Math.sqrt(2 * GRAVITY * distanceToTarget);

        return {
          id: nextCoinId + Math.random(),
          x: STAGE_WIDTH / 2 + (Math.random() - 0.5) * STAGE_WIDTH * 0.8,
          y: STAGE_HEIGHT + 50,
          speedX: (Math.random() - 0.5) * COIN_SPEED * 0.1,
          speedY: -requiredSpeed,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        };
      });

    setCoinPositions((prev) => {
      const combined = [...prev, ...newCoins];
      return combined.slice(-MAX_COINS);
    });
    setNextCoinId((id) => id + COINS_PER_THROW);
  }, [
    nextCoinId,
    STAGE_WIDTH,
    STAGE_HEIGHT,
    COIN_SPEED,
    MAX_COINS,
    specialParticle.active,
  ]);

  useEffect(() => {
    const interval = setInterval(createNewCoins, 300);
    return () => clearInterval(interval);
  }, [createNewCoins]);

  // Add special particle update to updatePositions
  const updatePositions = useCallback(() => {
    // Update regular coins
    setCoinPositions((prev) =>
      prev
        .map((coin) => {
          let newX = coin.x + coin.speedX;
          let newSpeedX = coin.speedX;

          // Bounce off left border
          if (newX < 20) {
            newX = 20;
            newSpeedX = Math.abs(coin.speedX) * 0.5; // Reverse direction and lose 20% speed
          }
          // Bounce off right border
          if (newX > STAGE_WIDTH - 20) {
            newX = STAGE_WIDTH - 20;
            newSpeedX = -Math.abs(coin.speedX) * 0.5; // Reverse direction and lose 20% speed
          }

          return {
            ...coin,
            x: newX,
            y: coin.y + coin.speedY,
            speedX: newSpeedX,
            speedY: coin.speedY + GRAVITY,
            rotation: coin.rotation + coin.rotationSpeed,
          };
        })
        .filter((coin) => coin.y < STAGE_HEIGHT + 100),
    );

    // Update special particle
    if (specialParticle.active) {
      setSpecialParticle((prev) => {
        let newX = prev.x + prev.speedX;
        let newSpeedX = prev.speedX;

        if (newX < 25) {
          newX = 25;
          newSpeedX = Math.abs(prev.speedX) * 0.8;
        }
        if (newX > STAGE_WIDTH - 25) {
          newX = STAGE_WIDTH - 25;
          newSpeedX = -Math.abs(prev.speedX) * 0.8;
        }

        const newY = prev.y + prev.speedY;
        const newSpeedY = prev.speedY + (GRAVITY - 2) * 0.3; // Reduced gravity effect

        // Deactivate if out of bounds
        if (newY > STAGE_HEIGHT + 100) {
          return { ...prev, active: false };
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          speedX: newSpeedX,
          speedY: newSpeedY,
          rotation: prev.rotation + prev.rotationSpeed,
        };
      });
    }
  }, [STAGE_WIDTH, STAGE_HEIGHT]);

  useEffect(() => {
    var stats = new Stats();
    stats.showPanel(0);
    // document.body.appendChild(stats.dom);

    // stats.dom.style.position = "absolute";
    // stats.dom.style.left = "0px";
    // stats.dom.style.top = "0px";
    // stats.dom.style.zIndex = "1000";

    let animationFrameId: number;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 30; // Target 30 FPS

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime;

      if (deltaTime >= frameInterval) {
        // Only update if enough time has passed
        stats.begin();
        updatePositions();
        stats.end();
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
      // Clean up stats
      // document.body.removeChild(stats.dom);
    };
  }, [updatePositions]);

  return (
    <div className="fixed left-0 top-0 h-full w-full">
      <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} options={stageOptions}>
        <ParticleContainer {...particleContainerProps}>
          {coinPositions.map((pos) => (
            <Sprite
              key={pos.id}
              texture={sharedTexture}
              x={pos.x}
              y={pos.y}
              rotation={pos.rotation}
              {...spriteProps}
            />
          ))}
        </ParticleContainer>

        {/* Render special particle on top. Highlight element without external library */}
        {specialParticle.active && (
          <Sprite
            texture={specialTexture}
            x={specialParticle.x}
            y={specialParticle.y}
            rotation={specialParticle.rotation}
            anchor={0.5}
            scale={SPECIAL_PARTICLE_SCALE}
            width={50 * SPECIAL_PARTICLE_SCALE}
            height={50 * SPECIAL_PARTICLE_SCALE}
            blendMode={BLEND_MODES.NORMAL}
          />
        )}

        <Container x={100} y={100}>
          <Text
            text=""
            anchor={0.5}
            x={50}
            y={150}
            filters={[blurFilter]}
            style={
              new TextStyle({
                align: "center",
                fill: "0xffffff",
                fontSize: 30,
                letterSpacing: 20,
                dropShadow: true,
                dropShadowColor: "#E72264",
                dropShadowDistance: 6,
              })
            }
          />
        </Container>
      </Stage>
    </div>
  );
};

export default CoinsFireworkPixie;
