import React from 'react';
import { useLang } from '../../lib/lang';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
};

export default function Input({ label, className, ...rest }: Props) {
	const { lang } = useLang();
	const dir = lang === 'he' ? 'rtl' : 'ltr';
	const textAlign = lang === 'he' ? 'right' : 'left';

		return (
			<div style={{ marginBottom: 12 }}>
				{label ? <label style={{ display: 'block', marginBottom: 6, color: '#555' }}>{label}</label> : null}
				<input
					{...rest}
					dir={dir}
					className={className}
					style={{
						...(rest.style || {}),
						border: '1px solid #ccc',
						borderRadius: 6,
						padding: '10px 14px',
						outline: 'none',
						background: '#fafafa',
						color: '#222',
						boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
						transition: 'border-color 0.2s',
						textAlign,
						direction: dir,
					}}
				/>
			</div>
		);
}
