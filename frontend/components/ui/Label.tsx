import React from 'react';

export default function Label({ children, htmlFor }: any) {
	return (
		<label htmlFor={htmlFor} style={{ display: 'block', marginBottom: 6 }}>
			{children}
		</label>
	);
}
