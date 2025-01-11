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

const App = () => {
  const blurFilter = useMemo(() => new BlurFilter(2), []);
  const STAGE_WIDTH = 500;
  const STAGE_HEIGHT = 900;
  const COIN_SPEED = 8;
  const GRAVITY = 0.15;
  const COINS_PER_THROW = 150;
  const MAX_COINS = 1000;

  // Create shared texture
  const sharedTexture = useMemo(() => {
    const baseTexture = new BaseTexture(coin.src);
    return new Texture(baseTexture);
  }, []);

  const lastTime = useRef(performance.now());
  const [coinPositions, setCoinPositions] = useState<CoinPosition[]>([]);
  const [nextCoinId, setNextCoinId] = useState(0);

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
      background: 0x1099bb,
      antialias: false,
      autoDensity: true,
      useContextAlpha: false,
      powerPreference: "high-performance" as WebGLPowerPreference,
      clearBeforeRender: true,
      backgroundColor: 0x1099bb,
    }),
    [],
  );

  // Memoize sprite props to prevent unnecessary updates
  const spriteProps = useMemo(
    () => ({
      anchor: 0.5,
      scale: 0.5,
      width: 50,
      height: 50,
      blendMode: BLEND_MODES.NORMAL,
    }),
    [],
  );

  const createNewCoins = useCallback(() => {
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
          speedX: (Math.random() - 0.5) * COIN_SPEED * 0.3,
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
  }, [nextCoinId, STAGE_WIDTH, STAGE_HEIGHT, COIN_SPEED, MAX_COINS]);

  useEffect(() => {
    const interval = setInterval(createNewCoins, 1000);
    return () => clearInterval(interval);
  }, [createNewCoins]);

  const updatePositions = useCallback(() => {
    setCoinPositions((prev) =>
      prev
        .map((coin) => {
          let newX = coin.x + coin.speedX;
          let newSpeedX = coin.speedX;

          // Bounce off left border
          if (newX < 25) {
            newX = 25;
            newSpeedX = Math.abs(coin.speedX) * 0.8; // Reverse direction and lose 20% speed
          }
          // Bounce off right border
          if (newX > STAGE_WIDTH - 25) {
            newX = STAGE_WIDTH - 25;
            newSpeedX = -Math.abs(coin.speedX) * 0.8; // Reverse direction and lose 20% speed
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
  }, [STAGE_WIDTH, STAGE_HEIGHT]);

  useEffect(() => {
    var stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    stats.dom.style.position = "absolute";
    stats.dom.style.left = "0px";
    stats.dom.style.top = "0px";
    stats.dom.style.zIndex = "1000";

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      stats.begin();
      updatePositions();
      stats.end();
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
      // Clean up stats
      document.body.removeChild(stats.dom);
    };
  }, [updatePositions]);

  return (
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
  );
};

export default App;
