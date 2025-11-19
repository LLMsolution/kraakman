# Kraakman - Componenten Systeem

## 🧩 Componenten Architectuur

Het Kraakman project gebruikt een gestructureerde componenten architectuur gebaseerd op React 18 + TypeScript met Shadcn/ui als basis. Alle componenten zijn ontworpen voor herbruikbaarheid, type safety en responsive design.

## 📂 Component Structuur

```
src/components/
├── ui/                    # Shadcn/ui basis componenten
│   ├── button.tsx         # Gestandaardiseerde button
│   ├── input.tsx          # Form input velden
│   ├── dialog.tsx         # Modal dialogs
│   ├── select.tsx         # Dropdown selects
│   ├── badge.tsx          # Status badges
│   └── label.tsx          # Form labels
├── CarCard.tsx            # Auto display card
├── CarFilters.tsx         # Filter interface
├── Navigation.tsx         # Site navigatie
├── PhotoManager.tsx       # Afbeelding beheer
├── Footer.tsx             # Site footer
└── TagInput.tsx           # Tags input component
```

## 🎯 UI Foundation Componenten

### Button Component (`ui/button.tsx`)

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-12 min-h-[48px]",
  {
    variants: {
      variant: {
        default: "bg-[#F1EFEC] text-[#030303] border-[#030303] hover:bg-[#123458] hover:text-[#F1EFEC] hover:border-[#123458]",
        secondary: "bg-[#123458] text-[#F1EFEC] border-[#123458] hover:bg-[#F1EFEC] hover:text-[#030303] hover:border-[#123458]",
        active: "bg-[#123458] text-[#F1EFEC] border-[#123458] hover:bg-[#123458] hover:text-[#F1EFEC] hover:border-[#123458]",
        ghost: "bg-transparent text-[#030303] border-transparent hover:bg-[#F1EFEC] hover:border-[#030303]",
      },
      size: {
        default: "px-4 py-3 leading-6",
        sm: "px-3 py-3 leading-6",
        lg: "px-8 py-3 leading-6",
        icon: "w-10 py-3 leading-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

**Gebruik:**
```tsx
// Default button
<Button>Click me</Button>

// Secondary variant
<Button variant="secondary">Secondary</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Menu className="h-6 w-6" />
</Button>

// Large primary button
<Button variant="secondary" size="lg">
  <Plus className="w-4 h-4 mr-2" />
  Nieuwe Auto
</Button>
```

### Input Component (`ui/input.tsx`)

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'kraakman';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const inputClasses = variant === 'kraakman'
      ? "h-12 border border-secondary bg-background focus:border-secondary focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-secondary transition-none leading-6 px-4 py-3"
      : cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      );

    return (
      <input
        type={type}
        className={inputClasses}
        ref={ref}
        {...props}
      />
    );
  }
);
```

## 🚗 Business Componenten

### CarCard Component

**Doel:** Toon auto informatie met afbeelding carousel en actie buttons

```typescript
interface CarCardProps {
  id: string;
  merk: string;
  model: string;
  bouwjaar: number;
  kilometerstand?: number;
  prijs: number;
  car_images?: CarImage[];
  opties?: string[];
  brandstof_type?: string;
  transmissie?: string;
  status?: "aanbod" | "verkocht";
  hideButton?: boolean;
  binnenkort_beschikbaar?: boolean;
  gereserveerd?: boolean;
}
```

**Key Features:**
- **Afbeelding carousel** met swipe support
- **Responsive layout** voor mobiel/desktop
- **Status badges** (binnenkort beschikbaar, gereserveerd)
- **Prijs weergave** met proper formatting
- **Variant layouts** voor verkocht vs beschikbaar

### CarFilters Component

**Doel:** Geavanceerd filter systeem voor auto zoekresultaten

```typescript
interface FilterOptions {
  merken: string[];
  minPrijs: number;
  maxPrijs: number;
  minBouwjaar: number;
  maxBouwjaar: number;
  brandstofTypes: string[];
  transmissieTypes: string[];
}
```

**Features:**
- **Custom dropdown** component met Button variant
- **Active filter badges** met remove functionality
- **Collapsible filter** panel
- **Real-time filtering** met onChange callbacks
- **Sorteren** op prijs, bouwjaar, kilometerstand

### Navigation Component

**Doel:** Site navigatie met mobile menu

```typescript
const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
```

**Features:**
- **Mobile-first** responsive design
- **Active state** indicators
- **Hamburger menu** voor mobile
- **Consistent spacing** met design system
- **Scroll behavior** optimalisatie

### PhotoManager Component

**Doel:** Afbeelding upload en beheer voor auto's

```typescript
interface PhotoManagerProps {
  carId: string;
  existingImages?: { url: string; display_order: number }[];
  onImagesChange: (images: CarImage[]) => void;
}
```

**Features:**
- **Drag & drop** file upload
- **Image preview** met thumbnails
- **Reorder** functionality
- **Delete** images
- **Progress indicators**

## 🎨 Design System Integration

### CSS Custom Properties

```css
:root {
  /* Spacing tokens */
  --space-1: 0.25rem;     /* 4px */
  --space-4: 1rem;        /* 16px */
  --space-6: 1.5rem;      /* 24px */
  --space-8: 2rem;        /* 32px */

  /* Component spacing */
  --spacing-card-padding: var(--space-6);    /* 24px */
  --spacing-button-gap: var(--space-4);      /* 16px */
  --spacing-form-gap: var(--space-6);        /* 24px */

  /* Color tokens */
  --color-primary: #123458;
  --color-secondary: #030303;
  --color-background: #F1EFEC;
}
```

### Responsive Design Patterns

```css
/* Mobile-first responsive classes */
.section-padding {
  @apply px-4 md:px-8 lg:px-16 xl:px-24;
}

.container-wide {
  @apply max-w-[1600px] mx-auto;
}

/* Grid layouts */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

## 📱 Responsive Component Behaviour

### CarCard Responsive

```typescript
// Mobile: Single column, larger images
// Tablet: 2-column grid
// Desktop: 3-column grid
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cars.map(car => (
    <CarCard key={car.id} {...carProps} />
  ))}
</div>
```

### Navigation Responsive

```typescript
// Desktop: Horizontal nav
<div className="hidden md:flex items-center justify-center h-20 w-full">
  <Link to="/">Home</Link>
  <Link to="/aanbod">Aanbod</Link>
</div>

// Mobile: Hamburger menu
<div className="md:hidden">
  <Button variant="ghost" size="icon" onClick={toggleMenu}>
    <Menu className="h-6 w-6" />
  </Button>
</div>
```

## 🔧 Component Utilities

### Custom Hooks

```typescript
// useImageGallery.ts - voor CarCard image carousel
const useImageGallery = (images: CarImage[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return { currentIndex, handleNext, handlePrev, touchHandlers };
};
```

### Helper Functions

```typescript
// utils/currency.ts
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// utils/car.ts
export const getCarDisplayName = (merk: string, model: string): string => {
  return `${merk} ${model}`;
};
```

## 🧪 Component Testing

### Test Structure

```typescript
// __tests__/CarCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CarCard } from '../CarCard';

describe('CarCard', () => {
  const mockProps = {
    id: 'test-1',
    merk: 'BMW',
    model: '3 Series',
    bouwjaar: 2022,
    prijs: 45000,
  };

  it('renders car information correctly', () => {
    render(<CarCard {...mockProps} />);

    expect(screen.getByText('BMW 3 Series')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('€ 45.000')).toBeInTheDocument();
  });

  it('shows navigation buttons when multiple images', () => {
    const propsWithImages = {
      ...mockProps,
      car_images: [
        { url: 'image1.jpg' },
        { url: 'image2.jpg' }
      ]
    };

    render(<CarCard {...propsWithImages} />);
    expect(screen.getByLabelText('Vorige foto')).toBeInTheDocument();
    expect(screen.getByLabelText('Volgende foto')).toBeInTheDocument();
  });
});
```

## 🔄 Component State Management

### Local State Patterns

```typescript
// Custom dropdown in CarFilters
const [isOpen, setIsOpen] = useState(false);

const handleSelect = (value: string) => {
  onChange(value);
  setIsOpen(false); // Close dropdown after selection
};

// Image gallery state in CarCard
const [currentImageIndex, setCurrentImage] = useState(0);
const [isTouching, setIsTouching] = useState(false);
```

### Server State Integration

```typescript
// Using TanStack Query for data fetching
const { data: cars, isLoading, error } = useQuery({
  queryKey: ['cars', filters],
  queryFn: () => carService.getCars(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Optimistic updates
const mutation = useMutation({
  mutationFn: carService.updateCar,
  onMutate: async (newCar) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries(['cars']);

    // Snapshot previous value
    const previousCars = queryClient.getQueryData(['cars']);

    // Optimistically update
    queryClient.setQueryData(['cars'], (old: Car[]) =>
      old?.map(car => car.id === newCar.id ? newCar : car)
    );

    return { previousCars };
  },
  onError: (err, newCar, context) => {
    // Rollback on error
    queryClient.setQueryData(['cars'], context?.previousCars);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['cars']);
  },
});
```

## 📏 Component Best Practices

### 1. **Type Safety**
```typescript
// Strong typing voor props
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  callbackProp?: (value: string) => void;
}
```

### 2. **Accessibility**
```typescript
// Proper ARIA labels
<Button
  onClick={handleNext}
  aria-label="Volgende foto"
  disabled={isLastImage}
>
  <ChevronRight />
</Button>

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
>
  Interactive content
</div>
```

### 3. **Performance**
```typescript
// React.memo voor expensive components
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* heavy computation */}</div>;
});

// useMemo voor computed values
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

### 4. **Error Handling**
```typescript
// Error boundaries
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="error-boundary">
      {children}
    </div>
  );
};

// Async error handling
const handleAsyncOperation = async () => {
  try {
    await apiCall();
  } catch (error) {
    toast({
      title: "Fout",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

---

Het componenten systeem van Kraakman is gebouwd met moderne React practices, TypeScript voor type safety, en een consistent design system voor herbruikbaarheid en onderhoudsgemak.