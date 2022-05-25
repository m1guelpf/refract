import toast, { Renderable, ValueOrFunction } from 'react-hot-toast'

export function toastOn<T>(
	fn: () => Promise<T>,
	msgs: {
		loading: Renderable
		success: ValueOrFunction<Renderable, T>
		error: ValueOrFunction<Renderable, any>
	}
): Promise<T> {
	return toast.promise<T>(fn(), msgs)
}
