import React, { useMemo, useState } from "react";
import { ColumnMetadata } from "../models";
import { useTableMetadata } from "../hooks";
import MarkdownRender from "./MarkdownRender";
import TickFormatter from "../services/TickFormatter";
import UtilsService from "../services/UtilsService";
import Table from "./Table";

type Props = {
  title: string;
  summary: string;
  data?: Array<object>;
  summaryBelow: boolean;
  columnsMetadata: ColumnMetadata[];
  sortByColumn?: string;
  sortByDesc?: boolean;
  significantDigitLabels: boolean;
  displayWithPages: boolean;
  showMobilePreview?: boolean;
};

const TableWidget = ({
  data,
  summaryBelow,
  summary,
  title,
  columnsMetadata,
  sortByDesc,
  sortByColumn,
  significantDigitLabels,
  displayWithPages,
}: Props) => {
  const { largestTickByColumn } = useTableMetadata(data);
  const [filteredJson, setFilteredJson] = useState<any[]>([]);

  useMemo(() => {
    let headers =
      data && data.length ? (Object.keys(data[0]) as Array<string>) : [];
    headers = headers.filter((h) => {
      const metadata = columnsMetadata
        ? columnsMetadata.find((c) => c.columnName === h)
        : undefined;
      return !metadata || !metadata.hidden;
    });
    const newFilteredJson = new Array<any>();
    for (const row of data || new Array<any>()) {
      const filteredRow = headers.reduce((obj: any, key: any) => {
        obj[key] = row[key];
        return obj;
      }, {});
      if (filteredRow !== {}) {
        newFilteredJson.push(filteredRow);
      }
    }
    setFilteredJson(newFilteredJson);
  }, [data, columnsMetadata]);

  const rows = useMemo(() => filteredJson || [], [filteredJson]);
  const columns = useMemo(() => {
    const keys = filteredJson.length
      ? Object.keys(filteredJson[0] as Array<string>)
      : [];

    return keys.map((header) => {
      return {
        Header: header,
        id: header,
        accessor: header,
        minWidth: 150,
        Cell: (props: any) => {
          const row = props.row.original;

          // Check if there is metadata for this column
          let columnMetadata;
          if (columnsMetadata) {
            columnMetadata = columnsMetadata.find(
              (cm) => cm.columnName === header
            );
          }

          return !UtilsService.isCellEmpty(row[header])
            ? TickFormatter.format(
                row[header],
                largestTickByColumn[header],
                significantDigitLabels,
                "",
                "",
                columnMetadata
              )
            : "-";
        },
      };
    });
  }, [
    largestTickByColumn,
    significantDigitLabels,
    columnsMetadata,
    filteredJson,
  ]);

  if (!filteredJson || filteredJson.length === 0) {
    return null;
  }

  return (
    <div
      aria-label={title}
      tabIndex={-1}
      className="overflow-x-hidden overflow-y-hidden"
    >
      <h2 className="margin-bottom-1">{title}</h2>
      {!summaryBelow && (
        <MarkdownRender
          source={summary}
          className="usa-prose margin-top-0 margin-bottom-3 tableSummaryAbove textOrSummary"
        />
      )}
      <Table
        selection="none"
        rows={rows}
        initialSortAscending={sortByDesc !== undefined ? !sortByDesc : true}
        initialSortByField={sortByColumn}
        disablePagination={!displayWithPages && rows.length < 25}
        columns={columns}
        sortByColumn={sortByColumn}
        sortByDesc={sortByDesc}
        title={title}
        mobileNavigation={columns.length < 3}
      />
      {summaryBelow && (
        <MarkdownRender
          source={summary}
          className="usa-prose margin-top-3 margin-bottom-0 tableSummaryBelow textOrSummary"
        />
      )}
    </div>
  );
};

export default TableWidget;
