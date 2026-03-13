export type ChartType = 'STANDARD' | 'DELUXE';

export function getChartTypeByMusicId(musicId: number): ChartType {
	return musicId > 9999 ? 'DELUXE' : 'STANDARD';
}

export function getJacketPath(musicId: number) {
	return `/d/jackets/${String(musicId % 10000).padStart(6, '0')}.png`;
}

export function getChartTypeIcon(chartType: ChartType) {
	return chartType === 'DELUXE' ? '/assets/icons/music_dx.png' : '/assets/icons/music_standard.png';
}
