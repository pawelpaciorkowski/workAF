import apiInstance from "../common";
import { AuthUser } from "../../../_types";
import { cacheRequest } from "../../../_utils";

export class FlowAPI {
  private headers: { Authorization: string; "Content-Type": string };
  private addAlert: any;
  refreshToken: any;

  constructor(authData: AuthUser, refreshToken: any, addAlert: any) {
    this.refreshToken = refreshToken;
    this.headers = {
      Authorization: `Bearer ${authData.token}`,
      "Content-Type": "application/json",
    };
    this.addAlert = addAlert;
  }

  async getFlowConfig(flowID?: string) {
    this.refreshToken();
    try {
      const response = flowID
        ? apiInstance.get(`flow/client/${flowID}`, { headers: this.headers })
        : apiInstance.post("flow/client", {}, { headers: this.headers });
      return response; // zwrócenie danych z odpowiedzi
    } catch (error: any) {
      this.addAlert("error", "Problem z pobraniem konfiguracji dla flow");
      return error.response;
    }
  }

  async saveStage(flowId: string, stageId: string, content: object) {
    this.refreshToken();
    try {
      return await apiInstance.patch(
        `flow/client/${flowId}/${stageId}`,
        content,
        { headers: this.headers }
      );
    } catch (error: any) {
      let context = null;
      if (error.response.data.error === "Validation errors")
        return error.response;
      if (error.response.data.hasOwnProperty("context")) {
        context = JSON.stringify(error.response.data.context);
      }
      this.addAlert("error", "Problem z zapisem kroku", context);
      return error.response;
    }
  }

  async resetFlow(flowId: string, stageId?: string) {
    this.refreshToken();
    const url = stageId
      ? `flow/client/${flowId}/${stageId}`
      : `flow/client/${flowId}`;
    try {
      return await apiInstance.put(url, {}, { headers: this.headers });
    } catch (error: any) {
      this.addAlert("error", "Problem z resetem Flow");
      return error.response;
    }
  }

  async getClientGroups() {
    try {
      return await apiInstance.get("flow/client/groups", {
        headers: this.headers,
      });
    } catch (error: any) {
      this.addAlert("error", "Problem z pobraniem grup klientów");
      throw error;
    }
  }

  async getClientInfoFromGusByNip(nip: string) {
    try {
      return await apiInstance.get(`gus/nip/${nip}`, { headers: this.headers });
    } catch (error: any) {
      this.addAlert("error", "Problem z wyszukaniem klienta w GUS");
      return error.response;
    }
  }

  async getLaboratories(filterObject?: any) {
    try {
      const filters = { ...filterObject, isActive: true };
      return await apiInstance.post("laboratories", filters, {
        headers: this.headers,
      });
    } catch (error: any) {
      this.addAlert("error", "Problem z pobraniem listy laboratoriów");
      return error.response;
    }
  }

  async getCollectionPoints(collectionPointIds?: number[]) {
    try {
      return await apiInstance.post(
        "collection-points",
        { collectionPointId: collectionPointIds },
        { headers: this.headers }
      );
    } catch (error: any) {
      this.addAlert("error", "Problem z pobraniem listy laboratoriów");
      return error.response;
    }
  }

  async getLaboratoriesWithCollectionPointsLimited(labList: number[]) {
    try {
      return await apiInstance.post(
        "laboratories?with-collection-points=true",
        labList,
        { headers: this.headers }
      );
    } catch (error: any) {
      this.addAlert("error", "Problem z pobraniem listy laboratoriów");
      return error.response;
    }
  }

  async getClientInfoFromRPWDLByNip(nip: string) {
    try {
      return await apiInstance.get(`healing-subject/nip/${nip}`, {
        headers: this.headers,
      });
    } catch (error: any) {
      this.addAlert("error", "Problem z pobraniem informacji z RPWDL po NIP");
      return error.response;
    }
  }

  async getClientInfoFromRPWDLByRegistrationBookNumber(nip: string) {
    try {
      return await apiInstance.get(
        `healing-subject/registration-book-number/${nip}`,
        { headers: this.headers }
      );
    } catch (error: any) {
      this.addAlert(
        "error",
        "Problem z pobraniem informacji z RPWDL po Numerze księgi rejestrowej"
      );
      return error.response;
    }
  }

  async getDictionaryByName(name: string) {
    switch (name) {
      case "laboratories":
        return this.getLaboratories();
      case "collectionPoints":
        return this.getCollectionPoints();
      default:
        this.addAlert("error", "Zdefiniuj konfiguracje słownika");
    }
  }

  async getFlows() {
    try {
      const response = await apiInstance.get("/flows", {
        headers: this.headers,
      });
      return await response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteApplication(flowID: number) {
    try {
      return await apiInstance.delete(`/flow/client/${flowID}`, {
        headers: this.headers,
      });
    } catch (error: any) {
      this.addAlert("error", "Problem z usunięciem wniosku");
      return error.response;
    }
  }

  async getApplicationHtml(flowID: number) {
    this.refreshToken();
    try {
      const response = await apiInstance.get(`flow/client/${flowID}/html`, {
        headers: {
          ...this.headers,
          Accept: "text/html",
        },
        responseType: "blob", // Pobieramy dane jako blob
      });

      if (response.status !== 200) {
        throw new Error(`Błąd: Status ${response.status}`);
      }

      return response; // Zwróć pełną odpowiedź
    } catch (error: any) {
      this.addAlert("error", "Problem z pobraniem HTML wniosku");
      throw error;
    }
  }

  async getApplicationPdf(flowID: number) {
    this.refreshToken();
    try {
      const response = await apiInstance.get(`flow/client/${flowID}/pdf`, {
        headers: {
          ...this.headers,
          Accept: "application/pdf", // Upewnij się, że akceptujesz poprawny typ
        },
        responseType: "blob", // Dane są zwracane jako blob
      });
      return response;
    } catch (error: any) {
      console.error("Error fetching PDF:", error);
      this.addAlert("error", "Problem z pobraniem PDF wniosku");
      return error.response;
    }
  }

  // async getApplications(isFinal: boolean, forceRefresh: boolean = false) {
  //   this.refreshToken();

  //   try {
  //     const apiCall = async () => {
  //       const response = await apiInstance.get(
  //         `/applications?is-final=${isFinal}`,
  //         {
  //           headers: this.headers,
  //         }
  //       );
  //       return response.data;
  //     };

  //     return await cacheRequest(
  //       "flowData",
  //       apiCall,
  //       5 * 60 * 1000,
  //       forceRefresh
  //     );
  //   } catch (error) {
  //     console.error("Błąd podczas aktualizacji danych:", error);
  //     throw error;
  //   }
  // }

  async getApplications(forceRefresh: boolean = false) {
    this.refreshToken();

    try {
      const apiCall = async () => {
        const response = await apiInstance.get(`/applications`, {
          headers: this.headers,
        });
        return response.data;
      };

      return await cacheRequest(
        "flowData",
        apiCall,
        5 * 60 * 1000,
        forceRefresh
      );
    } catch (error) {
      console.error("Błąd podczas aktualizacji danych:", error);
      throw error;
    }
  }

  async getAllApplications() {
    this.refreshToken();

    try {
      const response = await apiInstance.get(`/applications`, {
        headers: this.headers,
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Nieprawidłowy format danych: oczekiwano tablicy.");
      }

      return response.data;
    } catch (error) {
      console.error("Błąd podczas pobierania wszystkich aplikacji:", error);
      throw error;
    }
  }

  async fetchDataSource(source: string) {
    this.refreshToken();

    try {
      const response = await apiInstance.get(source, {
        headers: this.headers,
      });
      return response.data;
    } catch (error: any) {
      console.error("Błąd podczas pobierania danych z API:", error);
      this.addAlert(
        "error",
        "Problem z pobraniem danych z API",
        error.response?.data?.message || ""
      );
      throw error;
    }
  }

  async generateFile(
    flowName: string,
    flowId: string,
    fileType: string = "principals"
  ) {
    this.refreshToken();
    try {
      const response = await apiInstance.get(
        `/flow/${flowName}/${flowId}/generate/${fileType}`,
        { headers: this.headers }
      );

      if (!response || response.status !== 200) {
        throw new Error(
          `Błąd generowania pliku: ${response.status} ${response.statusText}`
        );
      }

      return response.data;
    } catch (error: any) {
      this.addAlert(
        "error",
        `Nie udało się wygenerować pliku ${fileType}: ${error.message}`
      );
      throw error;
    }
  }

  async getUploadedFile(
    flowName: string,
    fileType: string,
    fileTypeId: string
  ) {
    this.refreshToken();

    // Sprawdzenie, czy podano poprawny fileType
    const validFileTypes = [
      "agreement-file",
      "price-list",
      "cito-file",
      "test-dictionary",
      "price-list-without-price",
      "access-channel",
    ];

    if (!validFileTypes.includes(fileType)) {
      this.addAlert("error", `Nieprawidłowy typ pliku: ${fileType}`);
      throw new Error(`Nieprawidłowy typ pliku: ${fileType}`);
    }

    try {
      const response = await apiInstance.get(
        `/flow/${flowName}/${fileType}/${fileTypeId}`,
        { headers: this.headers }
      );

      if (!response || response.status !== 200) {
        throw new Error(
          `Błąd pobierania pliku: ${response.status} ${response.statusText}`
        );
      }

      return response.data;
    } catch (error: any) {
      this.addAlert("error", `Nie udało się pobrać pliku: ${error.message}`);
      throw error;
    }
  }

  async getUploadedFilesList(flowName: string) {
    // Ta funkcja nie ma sensu w obecnej formie, więc lepiej zwrócić pustą tablicę:
    this.refreshToken();
    return [];
  }

  async getFlowStatuses() {
    this.refreshToken();
    try {
      const response = await apiInstance.get(`/flow-statuses`, {
        headers: this.headers,
      });
      if (response.status !== 200 || !Array.isArray(response.data)) {
        throw new Error(
          "Nieprawidłowa odpowiedź z API: oczekiwano tablicy statusów."
        );
      }
      return response.data; // Zwrócenie tablicy statusów
    } catch (error: any) {
      console.error("Błąd podczas pobierania statusów:", error);
      this.addAlert("error", "Problem z pobraniem statusów wniosków");
      throw error;
    }
  }
}
