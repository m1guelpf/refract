import { FC, InputHTMLAttributes, ReactNode } from 'react'

const Input: FC<
	{
		label: string
		value: string
		as?: 'input' | 'textarea'
		onChange?: (string) => void
		description?: string | ReactNode
		hideLabel?: boolean
	} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>
> = ({ label, value, as: Component = 'input', onChange, description, hideLabel = false, ...props }) => {
	return (
		<div className="flex flex-col space-y-2">
			{!hideLabel && (
				<div>
					<label className="font-medium flex items-center">
						{label}
						{props.required ? (
							''
						) : (
							<span className="text-xs text-white/60 font-normal">&nbsp;(optional)</span>
						)}
					</label>
					{description && <p className="text-xs text-white/60 max-w-prose font-light">{description}</p>}
				</div>
			)}
			{/* @ts-ignore-next-line  */}
			<Component
				className="bg-white/20 rounded-xl py-2 px-4 max-w-lg placeholder-white/40 text-white/60 outline-none focus:bg-white/25 transition duration-300 resize-none"
				{...props}
				rows={3}
				value={value}
				onChange={event => onChange(event.target.value)}
			/>
		</div>
	)
}

export default Input
