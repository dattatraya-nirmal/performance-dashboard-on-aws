import React from "react";
import { useDateTimeFormatter } from "../hooks";
import { useTranslation } from "react-i18next";
import MarkdownRender from "../components/MarkdownRender";

interface Props {
  name?: string;
  topicAreaName?: string;
  description?: string;
  unpublished?: boolean;
  isMobile?: boolean;
  link?: React.ReactNode;
  lastUpdated?: Date;
}

function DashboardHeader(props: Props) {
  const dateFormatter = useDateTimeFormatter();
  const { t } = useTranslation();

  return (
    <div className="usa-prose">
      <div className={props.unpublished ? "" : "margin-top-0"}>
        <h1
          className={`display-inline-block ${
            props.isMobile ? "line-height-sans-2 " : ""
          }${
            props.unpublished ? "margin-bottom-0" : "margin-y-1 font-sans-xl"
          }`}
        >
          {props.name}
        </h1>
        {props.isMobile ? (
          <div className="margin-top-1">{props.link}</div>
        ) : (
          props.link
        )}
        <div className="text-base text-italic margin-bottom-2">
          {props.topicAreaName}
          {props.lastUpdated &&
            ` | ${t("LastUpdatedLabel")} ${dateFormatter(props.lastUpdated)}`}
        </div>
      </div>
      <div className={props.unpublished ? "" : "margin-y-2"}>
        {props.description && (
          <MarkdownRender
            source={props.description}
            className={
              props.unpublished ? "" : "font-sans-lg usa-prose margin-top-0"
            }
          />
        )}
      </div>
    </div>
  );
}

export default DashboardHeader;
