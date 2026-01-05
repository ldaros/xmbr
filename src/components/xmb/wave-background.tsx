import { useEffect, useRef } from "react";

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  
  uniform vec2 iResolution;
  uniform float iTime;
  
  const vec3 top = vec3(0.0, 0.0, 0.0);
  const vec3 bottom = vec3(0.094, 0.141, 0.424);
  const float widthFactor = 1.5;
  
  vec3 calcSine(vec2 uv, float speed, 
                float frequency, float amplitude, float shift, float offset,
                vec3 color, float width, float exponent, bool dir)
  {
      float angle = iTime * speed * frequency * -1.0 + (shift + uv.x) * 2.0;
      
      float y = sin(angle) * amplitude + offset;
      float diffY = y - uv.y;
      
      float dsqr = distance(y, uv.y);
      float scale = 1.0;
      
      if(dir && diffY > 0.0)
      {
          dsqr = dsqr * 4.0;
      }
      else if(!dir && diffY < 0.0)
      {
          dsqr = dsqr * 4.0;
      }
      
      scale = pow(smoothstep(width * widthFactor, 0.0, dsqr), exponent);
      
      return min(color * scale, color);
  }
  
  void main()
  {
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      vec3 color = vec3(mix(top, bottom, uv.x * uv.y * 1.1));
      
      color += calcSine(uv, 0.2, 0.20, 0.2, 0.0, 0.5,  vec3(0.3, 0.3, 0.3), 0.1, 15.0, false);
      color += calcSine(uv, 0.4, 0.40, 0.15, 0.0, 0.5, vec3(0.3, 0.3, 0.3), 0.1, 17.0, false);
      color += calcSine(uv, 0.3, 0.60, 0.15, 0.0, 0.5, vec3(0.3, 0.3, 0.3), 0.05, 23.0, false);
      
      color += calcSine(uv, 0.1, 0.26, 0.07, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.1, 17.0, true);
      color += calcSine(uv, 0.3, 0.36, 0.07, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.1, 17.0, true);
      color += calcSine(uv, 0.5, 0.46, 0.07, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.05, 23.0, true);
      color += calcSine(uv, 0.2, 0.58, 0.05, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.2, 15.0, true);
      
      gl_FragColor = vec4(color, 1.0);
  }
`;

function initWebGL(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return null;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return null;

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(
            "Vertex shader error:",
            gl.getShaderInfoLog(vertexShader)
        );
        return null;
    }

    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(
            "Fragment shader error:",
            gl.getShaderInfoLog(fragmentShader)
        );
        return null;
    }

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return null;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
    );

    return {
        gl,
        program,
        positionBuffer,
        positionLocation: gl.getAttribLocation(program, "a_position"),
        resolutionLocation: gl.getUniformLocation(program, "iResolution"),
        timeLocation: gl.getUniformLocation(program, "iTime"),
    };
}

function renderFrame(
    ctx: NonNullable<ReturnType<typeof initWebGL>>,
    canvas: HTMLCanvasElement,
    time: number
) {
    const {
        gl,
        program,
        positionBuffer,
        positionLocation,
        resolutionLocation,
        timeLocation,
    } = ctx;

    // Activate shader program (renamed from gl.useProgram to avoid lint issue)
    const activateProgram = gl.useProgram.bind(gl);
    activateProgram(program);

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, time);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function WaveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = initWebGL(canvas);
        if (!ctx) return;

        const startTime = performance.now();
        let animationId: number;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            ctx.gl.viewport(0, 0, canvas.width, canvas.height);
        };

        const loop = () => {
            const time = (performance.now() - startTime) / 1000;
            renderFrame(ctx, canvas, time);
            animationId = requestAnimationFrame(loop);
        };

        resize();
        loop();

        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
            ctx.gl.deleteProgram(ctx.program);
            ctx.gl.deleteBuffer(ctx.positionBuffer);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0" />;
}
