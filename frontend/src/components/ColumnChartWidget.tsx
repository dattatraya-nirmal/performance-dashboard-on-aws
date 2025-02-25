import React, { useCallback, useEffect, useRef, useState } from "react";
// @ts-ignore
import { CategoricalChartWrapper } from "recharts";
import {
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
  LabelList,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useColors, useYAxisMetadata, useWindowSize } from "../hooks";
import UtilsService from "../services/UtilsService";
import TickFormatter from "../services/TickFormatter";
import MarkdownRender from "./MarkdownRender";
import DataTable from "./DataTable";
import { ColumnDataType, CurrencyDataType, NumberDataType } from "../models";

type Props = {
  title: string;
  downloadTitle: string;
  summary: string;
  columns: Array<string>;
  data?: Array<any>;
  summaryBelow: boolean;
  isPreview?: boolean;
  hideLegend?: boolean;
  horizontalScroll?: boolean;
  stackedChart?: boolean;
  hideDataLabels?: boolean;
  setWidthPercent?: (widthPercent: number) => void;
  significantDigitLabels: boolean;
  colors?: {
    primary: string | undefined;
    secondary: string | undefined;
  };
  columnsMetadata: Array<any>;
  showMobilePreview?: boolean;
};

const ColumnChartWidget = (props: Props) => {
  const chartRef = useRef(null);
  const [columnsHover, setColumnsHover] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState<Array<string>>([]);
  const [chartLoaded, setChartLoaded] = useState(false);
  const { yAxisLargestValue, yAxisMargin } = useYAxisMetadata(
    chartRef,
    chartLoaded,
    props.significantDigitLabels
  );

  const colors = useColors(
    props.columns.length,
    props.colors?.primary,
    props.colors?.secondary
  );

  const pixelsByCharacter = 8;
  const previewWidth = 480;
  const fullWidth = 960;

  const getOpacity = useCallback(
    (dataKey) => {
      if (!columnsHover) {
        return 1;
      }
      return columnsHover === dataKey ? 1 : 0.2;
    },
    [columnsHover]
  );

  const windowSize = useWindowSize();
  const smallScreenPixels = 800;

  const { data, columns, showMobilePreview } = props;

  const columnsMetadataDict = new Map();
  props.columnsMetadata.forEach((el) =>
    columnsMetadataDict.set(el.columnName, el)
  );

  let padding;
  if (showMobilePreview || windowSize.width < smallScreenPixels) {
    padding = 20;
  } else if (props.isPreview) {
    padding = 60;
  } else {
    padding = 120;
  }

  const xAxisType = useCallback(() => {
    let columnMetadata;
    if (props.columnsMetadata && columns.length) {
      columnMetadata = props.columnsMetadata.find(
        (cm) => cm.columnName === columns[0]
      );
    }
    if (columnMetadata && columnMetadata.dataType === ColumnDataType.Text) {
      return "category";
    } else {
      return data && data.every((row) => typeof row[columns[0]] === "number")
        ? "number"
        : "category";
    }
  }, [data, columns, props.columnsMetadata]);

  const toggleColumns = (e: any) => {
    if (hiddenColumns.includes(e.dataKey)) {
      const hidden = hiddenColumns.filter((column) => column !== e.dataKey);
      setHiddenColumns(hidden);
    } else {
      setHiddenColumns([...hiddenColumns, e.dataKey]);
    }
  };

  /**
   * Calculate the width percent out of the total width
   * depending on the container. Width: (largestHeader + 1) *
   * headersCount * pixelsByCharacter + marginLeft + marginRight
   */
  const widthPercent =
    (((UtilsService.getLargestHeader(columns, data) + 1) *
      (data ? data.length : 0) *
      pixelsByCharacter +
      50 +
      50) *
      100) /
    (props.isPreview ? previewWidth : fullWidth);

  const valueAccessor =
    (attribute: string) =>
    ({ payload }: any) => {
      return payload;
    };

  useEffect(() => {
    if (props.setWidthPercent) {
      props.setWidthPercent(widthPercent);
    }
  }, [props, widthPercent]);

  return (
    <div
      aria-label={props.title}
      tabIndex={-1}
      className={`overflow-x-hidden overflow-y-hidden${
        widthPercent > 100 && props.horizontalScroll ? " scroll-shadow" : ""
      }`}
    >
      <h2 className={`margin-bottom-${props.summaryBelow ? "4" : "1"}`}>
        {props.title}
      </h2>
      {!props.summaryBelow && (
        <MarkdownRender
          source={props.summary}
          className="usa-prose margin-top-0 margin-bottom-4 chartSummaryAbove textOrSummary"
        />
      )}
      {data && data.length && (
        <ResponsiveContainer
          width={
            props.horizontalScroll ? `${Math.max(widthPercent, 100)}%` : "100%"
          }
          height={300}
        >
          <BarChart
            className="column-chart"
            data={props.data}
            margin={{ right: 0, left: yAxisMargin }}
            ref={(el: CategoricalChartWrapper) => {
              chartRef.current = el;
              setChartLoaded(!!el);
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={props.columns.length ? props.columns[0] : ""}
              type={xAxisType()}
              padding={{ left: padding, right: padding }}
              domain={["dataMin", "dataMax"]}
              interval={props.horizontalScroll ? 0 : "preserveStartEnd"}
              scale={xAxisType() === "number" ? "linear" : "auto"}
            />
            <YAxis
              type="number"
              tickFormatter={(tick: any) => {
                return TickFormatter.format(
                  Number(tick),
                  yAxisLargestValue,
                  props.significantDigitLabels,
                  "",
                  ""
                );
              }}
            />
            <Tooltip
              itemStyle={{ color: "#1b1b1b" }}
              isAnimationActive={false}
              formatter={(value: Number | String, name: string) => {
                // Check if there is metadata for this column
                let columnMetadata;
                if (props.columnsMetadata) {
                  columnMetadata = props.columnsMetadata.find(
                    (cm) => cm.columnName === name
                  );
                }

                return TickFormatter.format(
                  Number(value),
                  yAxisLargestValue,
                  props.significantDigitLabels,
                  "",
                  "",
                  columnMetadata
                );
              }}
            />
            {!props.hideLegend && (
              <Legend
                verticalAlign="top"
                onClick={toggleColumns}
                onMouseLeave={() => setColumnsHover(null)}
                onMouseEnter={(e: any) => setColumnsHover(e.dataKey)}
              />
            )}
            {props.columns.length &&
              props.columns.slice(1).map((column, index) => {
                return (
                  <Bar
                    dataKey={column}
                    fill={colors[index]}
                    key={index}
                    fillOpacity={getOpacity(column)}
                    hide={hiddenColumns.includes(column)}
                    isAnimationActive={false}
                    stackId={props.stackedChart ? "a" : `${index}`}
                  >
                    {!props.hideDataLabels &&
                      props.stackedChart &&
                      index === props.columns.length - 2 && (
                        <LabelList
                          position="top"
                          valueAccessor={valueAccessor(column)}
                          formatter={(tick: any) => {
                            return TickFormatter.stackedFormat(
                              tick,
                              yAxisLargestValue,
                              props.significantDigitLabels,
                              props.columns.slice(1),
                              props.columnsMetadata
                            );
                          }}
                        />
                      )}
                    {!props.hideDataLabels && !props.stackedChart && (
                      <LabelList
                        dataKey={column}
                        position="top"
                        formatter={(tick: any) =>
                          TickFormatter.format(
                            Number(tick),
                            yAxisLargestValue,
                            props.significantDigitLabels,
                            "",
                            "",
                            columnsMetadataDict.get(column)
                          )
                        }
                      />
                    )}
                  </Bar>
                );
              })}
          </BarChart>
        </ResponsiveContainer>
      )}
      <div>
        <DataTable
          rows={data || []}
          columns={columns}
          columnsMetadata={props.columnsMetadata}
          fileName={props.downloadTitle}
          showMobilePreview={showMobilePreview}
        />
      </div>
      {props.summaryBelow && (
        <div>
          <MarkdownRender
            source={props.summary}
            className="usa-prose margin-top-1 margin-bottom-0 chartSummaryBelow textOrSummary"
          />
        </div>
      )}
    </div>
  );
};

export default ColumnChartWidget;
