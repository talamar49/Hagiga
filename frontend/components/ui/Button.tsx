import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'default' | 'ghost';
};

export default function Button({ variant = 'default', children, className, ...rest }: Props) {
	const cls = variant === 'ghost' ? `btn btn-ghost ${className || ''}` : `btn ${className || ''}`;
	return (
		<button className={cls} {...rest}>
			{children}
		</button>
	);
}
