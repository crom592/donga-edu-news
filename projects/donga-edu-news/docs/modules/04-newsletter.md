# Module 04: 뉴스레터 시스템

## 목표
구독, 발송, 관리 기능 구현

## Domain Layer

### `src/domain/entities/Subscriber.ts`
```typescript
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  status: 'pending' | 'active' | 'unsubscribed';
  preferences: {
    categories: string[];
    frequency: 'daily' | 'weekly';
  };
  verificationToken?: string;
}
```

### `src/domain/entities/Newsletter.ts`
```typescript
export interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  articles: Article[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent';
  stats: {
    sent: number;
    opened: number;
    clicked: number;
  };
}
```

### `src/domain/usecases/SubscribeUseCase.ts`
```typescript
export class SubscribeUseCase {
  constructor(
    private subscriberRepo: SubscriberRepository,
    private emailService: EmailService,
  ) {}

  async execute(email: string, name?: string): Promise<Subscriber> {
    // 1. 중복 확인
    const existing = await this.subscriberRepo.findByEmail(email);
    if (existing?.status === 'active') {
      throw new Error('이미 구독 중입니다.');
    }
    
    // 2. 구독자 생성
    const subscriber = await this.subscriberRepo.create({
      email,
      name,
      status: 'pending',
      verificationToken: generateToken(),
    });
    
    // 3. 인증 이메일 발송
    await this.emailService.sendVerification(subscriber);
    
    return subscriber;
  }
}
```

## Infrastructure Layer

### `src/infrastructure/email/resend.ts`
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(subscriber: Subscriber) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_URL}/verify?token=${subscriber.verificationToken}`;
  
  await resend.emails.send({
    from: 'noreply@dongaedu.com',
    to: subscriber.email,
    subject: '동아교육신문 뉴스레터 구독 확인',
    html: `
      <h1>구독을 확인해주세요</h1>
      <p>아래 버튼을 클릭하면 구독이 완료됩니다.</p>
      <a href="${verifyUrl}">구독 확인하기</a>
    `,
  });
}

export async function sendNewsletter(newsletter: Newsletter, subscribers: Subscriber[]) {
  const batch = subscribers.map(sub => ({
    from: 'newsletter@dongaedu.com',
    to: sub.email,
    subject: newsletter.subject,
    html: newsletter.content,
  }));
  
  await resend.batch.send(batch);
}
```

## Presentation Layer

### 구독 폼
```typescript
'use client';

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await subscribe(email);
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };
  
  if (status === 'success') {
    return <p>확인 이메일을 보냈습니다. 메일함을 확인해주세요!</p>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소"
        required
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? '처리 중...' : '구독하기'}
      </button>
    </form>
  );
}
```

## 완료 기준
- [ ] Subscriber 엔티티 & Collection
- [ ] 구독 폼 UI
- [ ] 이메일 인증 플로우
- [ ] Newsletter 편집기 (관리자)
- [ ] 이메일 발송 (Resend)
- [ ] 구독 해지 기능
- [ ] 발송 통계
