import dynamic from 'next/dynamic'

const DynamicAr = dynamic(() => import('@/components/ar'), {
    loading: () => <p>carregando...</p>
})

export default function Home() {
    return <DynamicAr/>
}
