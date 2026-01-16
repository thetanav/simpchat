import { NextResponse } from "next/server";
import { z } from "zod";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

const CodeExecutionSchema = z.object({
  code: z.string().min(1),
  language: z.string().optional().default("bash"),
});

export const maxDuration = 30; // 30 seconds timeout for code execution

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CodeExecutionSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid request body",
          details: parsed.error.format(),
        }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const { code, language } = parsed.data;

    let commandToExecute = code;
    // Basic language handling - in a real-world scenario, use isolated containers (e.g., Docker)
    // for secure and robust execution of different languages.
    switch (language) {
      case "python":
        commandToExecute = `python -c '${code.replace(/'/g, "'\\''")}'`;
        break;
      case "javascript":
      case "node":
        commandToExecute = `node -e '${code.replace(/'/g, "'\\''")}'`;
        break;
      case "bash":
      default:
        // Assume it's a bash command
        break;
    }

    let stdout = "";
    let stderr = "";
    let exitCode: number | null = null;
    let error = "";

    try {
      const { stdout: out, stderr: err } = await execPromise(commandToExecute, {
        timeout: maxDuration * 1000, // Convert to milliseconds
        killSignal: "SIGKILL",
      });
      stdout = out;
      stderr = err;
      exitCode = 0; // If execPromise resolves, it means exit code was 0
    } catch (e: any) {
      stderr = e.stderr || e.message;
      stdout = e.stdout || "";
      exitCode = e.code || 1;
      error = e.message;
    }

    return NextResponse.json({
      stdout,
      stderr,
      exitCode,
      error: error || (stderr ? "Execution finished with errors in stderr." : undefined),
      success: !error && !stderr,
    });
  } catch (e: any) {
    console.error("Error in code execution API:", e);
    return new NextResponse(
      JSON.stringify({
        error: e.message || "Internal Server Error",
        success: false,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}
