import React from "react";
import { Metric, NumberDataType } from "../models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import TickFormatter from "../services/TickFormatter";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useColors } from "../hooks";

interface Props {
  metrics: Array<Metric>;
  metricPerRow: number;
  significantDigitLabels: boolean;
  metricsCenterAlign: boolean;
}

function MetricsCardGroup(props: Props) {
  const { t } = useTranslation();
  const primaryColor = useColors(1)[0];

  let rows = [];
  for (let i = 0; i < props.metrics.length; i += props.metricPerRow) {
    let row = [];
    for (
      let j = i;
      j < i + props.metricPerRow && j < props.metrics.length;
      j++
    ) {
      const metric = props.metrics[j];
      row.push(metric);
    }
    rows.push(row);
  }

  if (!props.metrics.length) {
    return null;
  }

  return (
    <div
      className="grid-col"
      style={props.metricsCenterAlign ? { textAlign: "center" } : {}}
    >
      {rows.map((row, i) => {
        return (
          <div key={i} className="grid-row flex-column">
            <div className="grid-col grid-row flex-row">
              {row.map((metric, j) => {
                return (
                  <div
                    className={`grid-col-${12 / props.metricPerRow} padding-05`}
                    key={j}
                  >
                    <div
                      className="display-flex flex-column border-base-lightest border-2px height-card padding-1 overflow-x-auto overflow-y-auto"
                      tabIndex={0}
                    >
                      <div className="flex-5">
                        <p className="text-base-darker text-bold margin-0 text-no-wrap">
                          {metric.title}
                        </p>
                      </div>
                      <div
                        className="flex-3 usa-tooltip"
                        data-position="bottom"
                        title={metric.value ? metric.value.toString() : ""}
                      >
                        <h1
                          className="margin-0 text-no-wrap"
                          style={{ color: primaryColor }}
                        >
                          {TickFormatter.formatNumber(
                            Number(metric.value),
                            Number(metric.value),
                            props.significantDigitLabels,
                            undefined,
                            metric.percentage,
                            metric.currency
                          )}
                        </h1>
                      </div>
                      <div className="flex-2">
                        {metric.changeOverTime && (
                          <div className="margin-top-05">
                            <FontAwesomeIcon
                              size="xs"
                              icon={
                                metric.changeOverTime[0] === "-"
                                  ? faArrowDown
                                  : faArrowUp
                              }
                              className="margin-right-2px"
                            />
                            {metric.changeOverTime.substring(1)}
                          </div>
                        )}
                      </div>
                      <div className="flex-2">
                        {metric.startDate && metric.endDate && (
                          <div className="margin-top-1px">
                            <span>
                              {dayjs(metric.startDate)
                                .locale(window.navigator.language.toLowerCase())
                                .format("MMM YYYY")}
                            </span>{" "}
                            {t("To")}{" "}
                            <span>
                              {dayjs(metric.endDate)
                                .locale(window.navigator.language.toLowerCase())
                                .format("MMM YYYY")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MetricsCardGroup;
