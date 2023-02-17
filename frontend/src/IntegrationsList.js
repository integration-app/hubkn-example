import { useIntegrationApp, useIntegration, useFieldMappingInstance, DataForm, useDataSourceInstance } from '@integration-app/react'
import { useDataSourceInstanceCollection } from '@integration-app/react/data-sources/useDataSourceInstanceCollection'
import { useDataSourceInstanceLocations } from '@integration-app/react/data-sources/useDataSourceInstanceLocations'
import { useState, useEffect } from 'react'

const INTEGRATION_KEY = "zoho"
const DATASOURCE_KEY = "deals"
const FIELD_MAPPING_KEY = "deals-mapping"
const FLOW_KEY = "get-deals"
function IntegrationsList() {

    const integrationApp = useIntegrationApp()
    const [collection, setCollection] = useState(true)
    const {
        integration: integration,
        refresh: refreshIntegration
    } = useIntegration(INTEGRATION_KEY)

    return (
        <>
            {
                integration ? (
                    <>
                        <p><img src={integration.logoUri} /></p>
                        <p>{integration.name}</p>
                        <div>{integration.connection ? (
                            <button onClick={async () => {
                                await integrationApp.integration(integration.key).disconnect();
                                refreshIntegration()
                            }}>Disconnect
                            </button>
                        ) : (
                            <button onClick={async () => {
                                await integrationApp.integration(integration.key).connect();
                                refreshIntegration()
                            }}>Connect
                            </button>
                        )}</div>

                        <DataSourceSelector dataSourceKey={DATASOURCE_KEY} integrationKey={INTEGRATION_KEY} refreshParent={refreshIntegration} collection={collection} setCollection={setCollection}></DataSourceSelector>

                        {collection && (
                            <>
                                <FieldMapping fieldMappingKey={FIELD_MAPPING_KEY} integrationKey={INTEGRATION_KEY}></FieldMapping>
                                <button onClick={() => {
                                    integrationApp.flowInstance({
                                        integrationKey: INTEGRATION_KEY,
                                        flowKey: FLOW_KEY,
                                        autoCreate: true
                                    }).run()
                                }}>Run</button>
                            </>)}

                    </>
                ) : (
                    <>Integration not found</>
                )
            }

        </>
    )
}

function FieldMapping(props) {

    const {
        fieldMappingInstance: fieldMappingInstance,
        patch: patchFieldMappingInstance
    } = useFieldMappingInstance({
        integrationKey: props.integrationKey,
        fieldMappingKey: props.fieldMappingKey,
        autoCreate: true,
    })


    if (fieldMappingInstance) {

        const importForm = new DataForm({
            schema: fieldMappingInstance.appSchema,
            value: fieldMappingInstance.importValue,
            variablesSchema: fieldMappingInstance.externalSchema,
        })


        function handleOptionSelected(field, idx) {
            const option = importForm.getFieldValueOptions(field)[idx]
            const newImportValue = importForm.setFieldValue(
                field,
                option ? option.value : undefined,
            )
            patchFieldMappingInstance({
                importValue: newImportValue,
            })
        }

        return (
            <>
                <table> <tbody>
                    <tr>
                        <th>Field</th>
                        <th>Value</th>
                    </tr>
                    {importForm.getFields().map((field) => (
                        <tr key={field.locator}>
                            <td>{field.name}</td>
                            <td>
                                <select
                                    onChange={(e) => handleOptionSelected(field, e.target.value)}
                                >
                                    <option></option>
                                    {importForm.getFieldValueOptions(field).map((option, idx) => (
                                        <option key={idx} value={idx} selected={option.selected}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody></table>
            </>
        )
    }
}

function DataSourceSelector(props) {
    const {
        dataSourceInstance: dataSourceInstance,
        loading: isDataSourceInstanceLoading,
        patch: patchDataSourceInstance
    } = useDataSourceInstance({
        integrationKey: props.integrationKey,
        dataSourceKey: props.dataSourceKey,
        autoCreate: true,
    })

    const [currentPath, setCurrentPath] = useState(dataSourceInstance?.rootPath)

    const { collection: collection, refresh: refreshCollection, loading: isDataSourceInstanceCollectionLoading } = useDataSourceInstanceCollection(dataSourceInstance)

    const { locations, loading: isDataSourceInstanceLocationsLoading } = useDataSourceInstanceLocations(dataSourceInstance, { path: currentPath })

    useEffect(() => {
        if (!currentPath && dataSourceInstance) {
            setCurrentPath(dataSourceInstance?.rootPath)
        }
    });

    if (dataSourceInstance && locations && collection) {
        if (isDataSourceInstanceLoading || isDataSourceInstanceLocationsLoading || isDataSourceInstanceCollectionLoading) {
            return (
                <p>Loading...</p>
            )
        } else {
            return (
                <>
                    {props.collection ? (
                        <>
                            <h3> Selected : {collection.name}</h3>
                            <button onClick={() => { props.setCollection() }}>Change</button>
                        </>
                    ) : (
                        <>
                            <h3>Change Data Source Location:</h3>
                            {locations.map((location) => {
                                return (
                                    <div key={location.path}>{location.name} <button onClick={async () => {
                                        if (location.type == "collection") {
                                            await patchDataSourceInstance({ path: location.path })
                                            refreshCollection()
                                            setCurrentPath()
                                            props.setCollection(location.path)
                                        } else {
                                            setCurrentPath(location.path)
                                        }

                                    }}>Select</button></div>
                                )
                            })}
                        </>
                    )}


                </>
            )
        }
    }
}

export default IntegrationsList;
