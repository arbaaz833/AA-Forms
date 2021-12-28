import React from 'react';
import Loader from '../Loader';
import styles from './index.module.css';

export default function PageLoader() {
    return (
        <div className={styles.container}>
            <Loader />
        </div>
    )
}
