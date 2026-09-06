export default function Header() {
    return (
        <header className="border-b">
             <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <h1 className="text-xl font-bold">
                    Electroshop
                </h1>

                <nav>
                    <ul className="flex items-center gap-6">
                        <li>Home</li>
                        <li>Products</li>
                        <li>Cart</li>
                    </ul>
                </nav>
            </div>
        </header>
    ); 
}