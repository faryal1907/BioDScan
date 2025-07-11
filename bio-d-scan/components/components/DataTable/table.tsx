import React, { useEffect, useState } from 'react';
import { DataTable } from 'mantine-datatable';

const PAGE_SIZES = [10, 20, 30, 50, 100];

const BeeDataTable = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]);
    const [recordsData, setRecordsData] = useState([]);
    const [search, setSearch] = useState('');
    const [filterField, setFilterField] = useState('id');
    const [sortStatus, setSortStatus] = useState({ columnAccessor: 'Date', direction: 'desc' });
    const [loading, setLoading] = useState(true);

    // Fetch data from /api/external-bee-data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/external-bee-data');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const result = await response.json();
                setInitialRecords(Array.isArray(result.data) ? result.data : []);
            } catch (error) {
                setInitialRecords([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    // Search functionality
    useEffect(() => {
        const filteredData = initialRecords.filter((item) => {
            if (!search) return true;
            const searchLower = search.toLowerCase();
            switch (filterField) {
                case 'id':
                    return item.id && String(item.id).toLowerCase().includes(searchLower);
                case 'Date':
                    return item.Date && String(item.Date).toLowerCase().includes(searchLower);
                case 'Time':
                    return item.Time && String(item.Time).toLowerCase().includes(searchLower);
                case 'Bumble Bee':
                    return item['Bumble Bee'] !== undefined && String(item['Bumble Bee']).includes(searchLower);
                case 'Honey Bee':
                    return item['Honey Bee'] !== undefined && String(item['Honey Bee']).includes(searchLower);
                case 'Lady Bug':
                    return item['Lady Bug'] !== undefined && String(item['Lady Bug']).includes(searchLower);
                case 'Total Count':
                    return item['Total Count'] !== undefined && String(item['Total Count']).includes(searchLower);
                case 'Temperature (C)':
                    return item['Temperature (C)'] !== undefined && String(item['Temperature (C)']).includes(searchLower);
                case 'Humidity (%)':
                    return item['Humidity (%)'] !== undefined && String(item['Humidity (%)']).includes(searchLower);
                case 'Location':
                    return item.Location && String(item.Location).toLowerCase().includes(searchLower);
                default:
                    return true;
            }
        });
        setRecordsData([...filteredData.slice(0, pageSize)]);
        setPage(1);
    }, [search, pageSize, initialRecords, filterField]);

    return (
        <div className="panel mt-6">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                    <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                        <h5 className="text-lg font-semibold dark:text-white-light">Bee Data Table</h5>
                        <div className="ltr:ml-auto rtl:mr-auto flex gap-2 items-center">
                            <select
                                value={filterField}
                                onChange={(e) => setFilterField(e.target.value)}
                                className="form-select w-auto"
                            >
                                <option value="id">ID</option>
                                <option value="Date">Date</option>
                                <option value="Time">Time</option>
                                <option value="Bumble Bee">Bumble Bee</option>
                                <option value="Honey Bee">Honey Bee</option>
                                <option value="Lady Bug">Lady Bug</option>
                                <option value="Total Count">Total Count</option>
                                <option value="Temperature (C)">Temperature (C)</option>
                                <option value="Humidity (%)">Humidity (%)</option>
                                <option value="Location">Location</option>
                            </select>
                            <input
                                type="text"
                                className="form-input w-auto"
                                placeholder={`Search ${filterField}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            highlightOnHover
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                { accessor: 'id', title: 'ID', sortable: true, render: (record) => record.id || 'N/A' },
                                { accessor: 'Date', title: 'Date', sortable: true, render: (record) => record.Date || 'N/A' },
                                { accessor: 'Time', title: 'Time', sortable: true, render: (record) => record.Time || 'N/A' },
                                { accessor: 'Bumble Bee', title: 'Bumble Bee', sortable: true, render: (record) => record['Bumble Bee'] !== undefined ? record['Bumble Bee'] : 'N/A' },
                                { accessor: 'Honey Bee', title: 'Honey Bee', sortable: true, render: (record) => record['Honey Bee'] !== undefined ? record['Honey Bee'] : 'N/A' },
                                { accessor: 'Lady Bug', title: 'Lady Bug', sortable: true, render: (record) => record['Lady Bug'] !== undefined ? record['Lady Bug'] : 'N/A' },
                                { accessor: 'Total Count', title: 'Total Count', sortable: true, render: (record) => record['Total Count'] !== undefined ? record['Total Count'] : 'N/A' },
                                { accessor: 'Temperature (C)', title: 'Temperature (C)', sortable: true, render: (record) => record['Temperature (C)'] !== undefined ? record['Temperature (C)'] : 'N/A' },
                                { accessor: 'Humidity (%)', title: 'Humidity (%)', sortable: true, render: (record) => record['Humidity (%)'] !== undefined ? record['Humidity (%)'] : 'N/A' },
                                { accessor: 'Location', title: 'Location', sortable: true, render: (record) => record.Location || 'N/A' },
                            ]}
                            totalRecords={initialRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={setPage}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default BeeDataTable;