import {IntegrationAppProvider} from "@integration-app/react";
import IntegrationsList from "./IntegrationsList";
import {useEffect, useState} from "react";

function App() {

    const [accessToken, setAccessToken] = useState()

    useEffect(() => {
        (async () => {
            // Get Integration App Access Token from your backend
            const tokenResp = await fetch("http://localhost:8080/integration-token")
            setAccessToken(await tokenResp.json())
        })()
    }, [])
    if (accessToken) {
        return (
            // IntegrationAppProvider allows you to use Integration.app React hooks in all child components
            <IntegrationAppProvider token={accessToken}>
                <IntegrationsList/>
            </IntegrationAppProvider>
        )
    }
}

export default App