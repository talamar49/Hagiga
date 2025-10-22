import React from 'react';

export default function Card({ children, className, style }: any) {
	return (
		<div className={`card ${className || ''}`} style={style}>
			{children}
		</div>
	);
}
