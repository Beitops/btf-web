export interface InformacionLuz {
	validacionLuz?: string;
	cups?: string;
	peaje?: string;
	fechaInicio?: string;
	fechaFin?: string;
	diasFacturados?: number;
	energiaConsumida?: number;
	precioTotal?: number;
	consumoP1?: number;
	consumoP2?: number;
	consumoP3?: number;
	potenciaContratadaP1?: number;
	potenciaContratadaP2?: number;
	costeServicio?: number;
	discriminacionHoraria?: string;
	annual_consumption?: number;
	[key: string]: unknown;
}

export interface SavingCalculation {
	provider_name?: string;
	plan_name?: string;
	invoice_savings?: number;
	yearly_savings?: number;
	total_amount?: number;
	energy_cost?: number;
	power_cost?: number;
	discount_cost?: number;
	service_cost?: number;
	[key: string]: unknown;
}

export interface InformacionComparativa {
	savings_status?: string;
	electric_information?: {
		total_cost?: number;
		recalculated_total_cost?: number;
		[key: string]: unknown;
	};
	saving_calculations?: SavingCalculation[];
}

export interface FacturaData {
	status?: string;
	nombreProveedor?: string;
	idRegistro?: number;
	nif?: string | null;
	isCif?: boolean | null;
	bonoSocial?: boolean;
	cupsLuz?: string | null;
	informacionLuz?: InformacionLuz | null;
	informacionComparativa?: InformacionComparativa | null;
}

export interface ApiResponse {
	success: boolean;
	message: string;
	data: {
		cliente: unknown;
		factura: FacturaData | null;
		rawManifest: unknown;
	} | null;
	errors?: {
		cliente?: { code: string; message: string };
		factura?: { code: string; message: string };
	};
	warnings?: Array<{ source: string; code: string; message: string }>;
}
