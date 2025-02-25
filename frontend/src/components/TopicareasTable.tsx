import React, { useState } from "react";
import { useSettings } from "../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { TopicArea } from "../models";
import Button from "./Button";
import { useTranslation } from "react-i18next";

interface Props {
  topicAreas: Array<TopicArea>;
  onSelect?: Function;
}

interface SelectionHashMap {
  [topicareaId: string]: TopicArea;
}

type ColumnType = "name" | "createdBy" | "dashboards";
type Direction = "up" | "down";

function TopicareasTable(props: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<SelectionHashMap>({});
  const [sortedBy, setSortedBy] = useState<ColumnType>("dashboards");
  const [direction, setDirection] = useState<Direction>("down");

  const { settings } = useSettings();

  const onSelect = (topicarea: TopicArea) => {
    const selection = { [topicarea.id]: topicarea };
    setSelected(selection);
    onSelectCallback(selection);
  };

  const isSelected = (topicarea: TopicArea) => {
    return !!selected[topicarea.id];
  };

  const onSelectCallback = (selection: SelectionHashMap) => {
    if (props.onSelect) {
      props.onSelect(Object.values(selection));
    }
  };

  const sortBy = (columnType: ColumnType) => {
    if (sortedBy === columnType) {
      setDirection(direction === "down" ? "up" : "down");
    } else {
      setDirection("down");
      setSortedBy(columnType);
    }
  };

  return (
    <table className="usa-table usa-table--borderless" width="100%">
      <thead>
        <tr>
          <th></th>
          <th>
            <span className="font-sans-xs">{t("TopicArea")}</span>
            <Button
              variant="unstyled"
              className={`margin-left-1 hover:text-base-light ${
                sortedBy === "name" ? "text-base-darker" : "text-white"
              }`}
              onClick={() => sortBy("name")}
              ariaLabel={t("SortTopicAreaName")}
            >
              <FontAwesomeIcon
                icon={
                  sortedBy === "name" && direction === "up"
                    ? faChevronUp
                    : faChevronDown
                }
              />
            </Button>
          </th>
          <th>
            <span className="font-sans-xs">{t("Dashboards")}</span>
            <Button
              variant="unstyled"
              className={`margin-left-1 hover:text-base-light ${
                sortedBy === "dashboards" ? "text-base-darker" : "text-white"
              }`}
              onClick={() => sortBy("dashboards")}
              ariaLabel={t("SortDashboards")}
            >
              <FontAwesomeIcon
                icon={
                  sortedBy === "dashboards" && direction === "up"
                    ? faChevronUp
                    : faChevronDown
                }
              />
            </Button>
          </th>
          <th>
            <span className="font-sans-xs">{t("CreatedBy")}</span>
            <Button
              variant="unstyled"
              className={`margin-left-1 hover:text-base-light ${
                sortedBy === "createdBy" ? "text-base-darker" : "text-white"
              }`}
              onClick={() => sortBy("createdBy")}
              ariaLabel={t("SortCreatedBy")}
            >
              <FontAwesomeIcon
                icon={
                  sortedBy === "createdBy" && direction === "up"
                    ? faChevronUp
                    : faChevronDown
                }
              />
            </Button>
          </th>
        </tr>
      </thead>
      <tbody>
        {sortTopicAreas(props.topicAreas, sortedBy, direction).map(
          (topicarea) => (
            <tr key={topicarea.id}>
              <td>
                <label className="usa-sr-only" htmlFor={topicarea.id}>
                  {topicarea.name}
                </label>
                <input
                  type="radio"
                  id={topicarea.id}
                  checked={isSelected(topicarea)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!isSelected(topicarea) && e.target.checked) {
                      onSelect(topicarea);
                    }
                  }}
                />
              </td>
              <td>
                <span className="text-bold text-base-darker font-sans-md">
                  {topicarea.name}
                </span>
              </td>
              <td>
                <span className="font-sans-md">
                  {topicarea.dashboardCount || "-"}
                </span>
              </td>
              <td>
                <span className="font-sans-md">{topicarea.createdBy}</span>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

function sortTopicAreas(
  topicAreas: Array<TopicArea>,
  sortedBy: ColumnType,
  direction: Direction
): Array<TopicArea> {
  const sortedTopicAreas = [...topicAreas];
  if (sortedBy === "name") {
    sortedTopicAreas.sort((a: TopicArea, b: TopicArea) =>
      direction === "down"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  } else if (sortedBy === "createdBy") {
    sortedTopicAreas.sort((a: TopicArea, b: TopicArea) =>
      direction === "down"
        ? a.createdBy.localeCompare(b.createdBy)
        : b.createdBy.localeCompare(a.createdBy)
    );
  } else if (sortedBy === "dashboards") {
    sortedTopicAreas.sort((a: TopicArea, b: TopicArea) =>
      direction === "down"
        ? b.dashboardCount - a.dashboardCount
        : a.dashboardCount - b.dashboardCount
    );
  }
  return sortedTopicAreas;
}

export default TopicareasTable;
