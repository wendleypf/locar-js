'use client'
import dynamic from 'next/dynamic'

const DynamicAr = dynamic(() => import('@/components/ar'), {
    ssr: false,
    loading: () => <p>carregando...</p>
})

export default function Home() {
    return <DynamicAr/>
}
