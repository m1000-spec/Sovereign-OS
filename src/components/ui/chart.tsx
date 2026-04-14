import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "../../lib/utils"

// Minimal ChartContainer for the requested implementation
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: any
    children: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex aspect-square justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-border/50 [&_.recharts-cartesian-grid-vertical_line]:stroke-border/50 [&_.recharts-curve.recharts-area]:fill-primary/10 [&_.recharts-curve.recharts-area]:stroke-primary [&_.recharts-dot]:fill-background [&_.recharts-dot]:stroke-primary [&_.recharts-dot]:stroke-[2] [&_.recharts-grid-line]:stroke-border/50 [&_.recharts-label]:fill-foreground [&_.recharts-polar-grid-concentric-polygon]:stroke-border/50 [&_.recharts-polar-grid-concentric-path]:stroke-border/50 [&_.recharts-polar-grid-radial-line]:stroke-border/50 [&_.recharts-radar-cursor]:fill-muted [&_.recharts-sector]:stroke-background [&_.recharts-sector]:stroke-[2] [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  any
>(
  (
    props,
    ref
  ) => {
    const {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    } = props;
    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-white/10 bg-black/90 px-2.5 py-1.5 text-xs shadow-xl text-white",
          className
        )}
      >
        {!hideLabel && (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter ? labelFormatter(label, payload) : label}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = {} as any

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0 border-l-2 border-dashed bg-transparent":
                          indicator === "dashed",
                        "my-0.5": indicator === "line" && !!label,
                      }
                    )}
                    style={
                      {
                        "--color-bg": item.color || item.payload.fill,
                        "--color-border": item.color || item.payload.fill,
                      } as React.CSSProperties
                    }
                  />
                )}
                <div
                  className={cn(
                    "flex flex-1 justify-between leading-none",
                    indicator === "line" ? "items-end" : "items-center"
                  )}
                >
                  <div className="grid gap-1.5">
                    {hideLabel && (
                      <span className="text-white/60">
                        {itemConfig[key]?.label || item.name}
                      </span>
                    )}
                    <span className="font-medium tabular-nums text-white">
                      {item.value?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
