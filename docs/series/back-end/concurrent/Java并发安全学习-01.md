---
title: Java并发安全学习-认识并发问题
date: 2021/12/08
tags:
 - AQS
categories:
 - back-end
---
## 多线程环境下的并发问题

```java
/**
 * @author WhiteRaisin
 * @className ConcurrenceDemo
 * @description
 * @date 2021/12/12 12:49 AM
 */
public class ConcurrenceDemo {

    private static int sum = 0;

    public static void main(String[] args) {
        // 创建十个线程
        for (int i = 0; i < 10; i++) {
            Thread t = new Thread(() -> {
                for (int j = 0; j < 50000; j++) {
                    sum++;
                }
            });
            t.start();
        }
        // 确保任务执行完成
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 输出结果
        System.out.println(sum);
    }
}

```

console result:

```tex
255407

Process finished with exit code 0
```

预期结果应该是 500000(10 x 5000)，相差甚远，而且每次的运行结果都可能不一样，这就是多线程环境下引发的并发安全问题



## 解决方法

### 1. synchronized

使用 `synchronized` 关键字为代码加锁，关键是要让这段代码成为一段原子性的操作

```java
								for (int j = 0; j < 50000; j++) {
                    sum++;
                }
```

改造后的代码

```java
public class ConcurrenceDemo {

    private static int sum = 0;

    public static void main(String[] args) {
        // 创建十个线程
        for (int i = 0; i < 10; i++) {
            Thread t = new Thread(() -> {
                // 也可以创建一个静态对象给对象加锁
                synchronized (ConcurrenceDemo.class) {
                    for (int j = 0; j < 50000; j++) {
                        sum++;
                    }
                }
            });
            t.start();
        }
        // 确保任务执行完成
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 输出结果
        System.out.println(sum);
    }
}

```



console result:

无论运行几次都达到了我们想要的结果

```tex
500000

Process finished with exit code 0
```



### 2. Lock

通过加锁来实现

```java
public class ConcurrenceDemo {

    private static int sum = 0;

    private static Lock lock = new ReentrantLock();

    public static void main(String[] args) {
        // 创建十个线程
        for (int i = 0; i < 10; i++) {
            Thread t = new Thread(() -> {
                lock.lock();
                try {
                    for (int j = 0; j < 50000; j++) {
                        sum++;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    // 一定要在finally中释放锁
                    lock.unlock();
                }
            });
            t.start();
        }
        // 确保任务执行完成
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 输出结果
        System.out.println(sum);
    }
}
```

结果一样得到了我们想要的结果



### 3. CAS

实际Java 中已经封装好了支持原子操作的包装类，我们只需要直接调用即可

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/20211212011752.png)

```java
public class ConcurrenceDemo {

    private static AtomicInteger sum = new AtomicInteger(0);

    public static void main(String[] args) {
        // 创建十个线程
        for (int i = 0; i < 10; i++) {
            Thread t = new Thread(() -> {
                for (int j = 0; j < 50000; j++) {
                    sum.getAndIncrement();
                }
            });
            t.start();
        }
        // 确保任务执行完成
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 输出结果
        System.out.println(sum);
    }
}

```

结果当然和上面一样，而且在编码上是最清爽的一种了



### 4. 手动实现CAS

通过反射实现 获取 Unsafa 的工厂方法

```java
public class UnsafeFactory {

    /**
     * 获取 Unsafe 对象
     * @return
     */
    public static Unsafe getUnsafe() {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            return (Unsafe) field.get(null);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 获取字段的内存偏移量
     * @param unsafe
     * @param clazz
     * @param fieldName
     * @return
     */
    public static long getFieldOffset(Unsafe unsafe, Class clazz, String fieldName) {
        try {
            return unsafe.objectFieldOffset(clazz.getDeclaredField(fieldName));
        } catch (NoSuchFieldException e) {
            throw new Error(e);
        }
    }
}

```

实现一把CASLock

```java
public class CASLock {

    //加锁标记
    private volatile int state;
    private static final Unsafe UNSAFE;
    private static final long OFFSET;

    static {
        try {
            UNSAFE = UnsafeFactory.getUnsafe();
            OFFSET = UnsafeFactory.getFieldOffset(
                    UNSAFE, CASLock.class, "state");
        } catch (Exception e) {
            throw new Error(e);
        }
    }

    public boolean cas() {
        return UNSAFE.compareAndSwapInt(this, OFFSET, 0, 1);
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

}
```

```java
public class ConcurrenceDemo {

    // 必须保证可见性
    private volatile static int sum = 0;

    private static CASLock casLock = new CASLock();

    public static void main(String[] args) {
        // 创建十个线程
        for (int i = 0; i < 10; i++) {
            Thread t = new Thread(() -> {
                for(;;) {
                    // state=1 
                    if(casLock.getState() == 0 && casLock.cas()) {
                        try {
                            for (int j = 0; j < 50000; j++) {
                                sum++;
                            }
                        } finally {
                            // state=0
                            casLock.setState(0);
                        }
                        break;
                    }
                }
            });
            t.start();
        }
        // 确保任务执行完成
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 输出结果
        System.out.println(sum);
    }
}
```

结果也是一样的通过CAS保证了安全



## 总结

以上只是简单实现了多线程环境下的并发安全问题，实际项目中的场景会复杂更多倍，所以要针对实际的场景来设计使用哪种方式去处理并发安全问题，后续会深入学习每一种方式的实现原理，以及它们的优缺点。