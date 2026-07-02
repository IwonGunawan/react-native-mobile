import { colors } from "../theme";

export const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabut']

export const MONTHS = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export const STATUS_MAP: Record<string, {label: string, color: string, bg:string}> = {
  '0' : { label: 'Belum Bayar',  color: colors.warning, bg: colors.warning + '15'},
  '1' : { label: 'Lunas', color: colors.success, bg: colors.success +'15'},
  '2' : { label: 'Kurang Bayar', color: colors.danger, bg: colors.danger + '15'},
  '3' : { label: 'Lebih Bayar', color: colors.info, bg: colors.info + '15'}
}