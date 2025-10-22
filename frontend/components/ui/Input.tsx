import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
};

export default function Input({ label, className, ...rest }: Props) {
	return (
		<div style={{ marginBottom: 12 }}>
			{label ? <label style={{ display: 'block', marginBottom: 6 }}>{label}</label> : null}
			<input className={className} {...rest} />
		</div>
	);
}
