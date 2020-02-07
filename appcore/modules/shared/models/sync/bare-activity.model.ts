import { ElevateSport } from "../../enums";

export class BareActivityModel {
	public id: number | string;
	public name: string;
	public type: ElevateSport;
	public display_type: string;
	public private: boolean;
	public bike_id: number;
	public start_time: string;
	public end_time: string;
	public distance_raw: number;
	public short_unit: string;
	public moving_time_raw: number;
	public elapsed_time_raw: number;
	public hasPowerMeter: boolean;
	public trainer: boolean;
	public commute: boolean;
	public elevation_unit: string;
	public elevation_gain_raw: number;
	public calories: number;
	public map_summary_polyline?: string;
}
