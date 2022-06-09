import { useCallback, useMemo, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DataGrid, { Column, HeaderRendererProps, SortColumn } from 'react-data-grid';

import DraggableHeaderRenderer from './components/DraggableHeader';

interface Row {
  id: number;
  key: string;
  description: string;
  organization: string;
  hasSurveys: boolean;
  hasHelper: boolean;
  pictures: boolean;
  defaultEquipment: string;
  status: string;
}

function createRows(): Row[] {
  const rows = [];
  for (let i = 1; i < 500; i++) {
    rows.push({
      id: i,
      key: `Route ${i}`,
      description: 'Route Description',
      organization: ['Organization 1', 'Organization 2'][Math.round(Math.random() * 1)],
      hasSurveys: [true, false][Math.round(Math.random() * 1)],
      hasHelper: [true, false][Math.round(Math.random() * 1)],
      pictures: [true, false][Math.round(Math.random() * 1)],
      defaultEquipment: ['eq-jessica', 'equipment-GMD_1432-cy'][Math.round(Math.random() * 1)],
      status: ['STARTED', 'NOT_STARTED', 'DEPARTED_ORIGIN', 'COMPLETED', 'IN_PROGRESS'][Math.round(Math.random() * 4)]
    });
  }

  return rows;
}

function createColumns(): Column<Row>[] {
  return [
    {
      key: 'key',
      name: 'Key',
      width: 200,
      frozen: true,
      resizable: true,
      sortable: true
    },
    {
      key: 'description',
      name: 'Description',
      width: 200,
      frozen: true,
      resizable: true,
      sortable: true
    },
    {
      key: 'organization',
      name: 'Organization',
      width: 200,
      resizable: true,
      sortable: true
    },
    {
      key: 'hasSurveys',
      name: 'Survey Answers',
      width: 200,
      resizable: true,
      sortable: true,
      formatter(props) {
        const hasHelper = props.row.hasSurveys;

        return (
          <div className="icon">
            <div className={hasHelper ? 'surveys-icon has-surveys' : 'surveys-icon'} />
          </div>
        );
      },
    },
    {
      key: 'pictures',
      name: 'Pictures',
      width: 200,
      resizable: true,
      sortable: true,
      formatter(props) {
        const hasHelper = props.row.pictures;

        return (
          <div className="icon">
            <div className={hasHelper ? 'picture-icon has-picture' : 'picture-icon'} />
          </div>
        );
      },
    },
    {
      key: 'defaultEquipment',
      name: 'Default Equipment',
      width: 200,
      resizable: true,
      sortable: true
    },
    {
      key: 'hasHelper',
      name: 'Helper',
      width: 200,
      resizable: true,
      sortable: true,
      formatter(props) {
        const hasHelper = props.row.hasHelper;

        return (
          <div className="icon">
            <div className={hasHelper ? 'helper-point has-helper' : 'helper-point'} />
          </div>
        );
      },
    },
    {
      key: 'status',
      name: 'Route Status',
      width: 200,
      resizable: true,
      sortable: true,
    }
  ];
}

export default function App() {
  const [rows] = useState(createRows);
  const [columns, setColumns] = useState(createColumns);
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  const onSortColumnsChange = useCallback((sortColumns: SortColumn[]) => {
    debugger
    setSortColumns(sortColumns.slice(-1));
  }, []);

  const draggableColumns = useMemo(() => {
    function HeaderRenderer(props: HeaderRendererProps<Row>) {
      return <DraggableHeaderRenderer {...props} onColumnsReorder={handleColumnsReorder} />;
    }

    function handleColumnsReorder(sourceKey: string, targetKey: string) {
      const sourceColumnIndex = columns.findIndex((c) => c.key === sourceKey);
      const targetColumnIndex = columns.findIndex((c) => c.key === targetKey);
      const reorderedColumns = [...columns];

      reorderedColumns.splice(
        targetColumnIndex,
        0,
        reorderedColumns.splice(sourceColumnIndex, 1)[0]
      );

      setColumns(reorderedColumns);
    }

    return columns.map((c) => {
      if (c.key === 'id') return c;
      return { ...c, headerRenderer: HeaderRenderer };
    });
  }, [columns]);

  const sortedRows = useMemo((): readonly Row[] => {
    if (sortColumns.length === 0) return rows;
    const { columnKey, direction } = sortColumns[0];

    let sortedRows: Row[] = [...rows];

    switch (columnKey) {
      case 'task':
      case 'priority':
      case 'issueType':
        sortedRows = sortedRows.sort((a, b) => a[columnKey].localeCompare(b[columnKey]));
        break;
      case 'complete':
        sortedRows = sortedRows.sort((a, b) => a[columnKey] - b[columnKey]);
        break;
      default:
    }
    return direction === 'DESC' ? sortedRows.reverse() : sortedRows;
  }, [rows, sortColumns]);

  return (
    <>
      <h1>Route Summary</h1>
      <DndProvider backend={HTML5Backend}>
        <DataGrid
          headerRowHeight={26}
          rowHeight={50}
          columns={draggableColumns}
          rows={sortedRows}
          sortColumns={sortColumns}
          onSortColumnsChange={onSortColumnsChange}
          style={{ width: '1600px' }}
        />
      </DndProvider>
    </>
  );
}
