#!/usr/bin/env python3
import time
import requests
import statistics
import sys
import json

# ============================================================
#  📊 TAVERNA LATENCY BENCHMARK — Phase B Observability
#  Proyecto: SILLY_TAVERN__Q2M8
# ============================================================

def benchmark_bridge(port, name, iterations=10):
    url = f"http://localhost:{port}/health"
    latencies = []
    
    print(f"  🔍 Benchmarking {name} on port {port}...")
    
    for i in range(iterations):
        try:
            start_time = time.perf_counter()
            response = requests.get(url, timeout=2)
            end_time = time.perf_counter()
            
            if response.status_code == 200:
                latency_ms = (end_time - start_time) * 1000
                latencies.append(latency_ms)
                # print(f"    - Iteration {i+1}: {latency_ms:.2f}ms")
            else:
                print(f"    ❌ Iteration {i+1} failed with status {response.status_code}")
        except Exception as e:
            print(f"    ❌ Iteration {i+1} error: {str(e)}")
        
        time.sleep(0.5) # Throttle to avoid flooding

    if not latencies:
        return None

    stats = {
        "mean": statistics.mean(latencies),
        "median": statistics.median(latencies),
        "stdev": statistics.stdev(latencies) if len(latencies) > 1 else 0,
        "min": min(latencies),
        "max": max(latencies),
        "p99": sorted(latencies)[-1] # Simplified for small samples
    }
    return stats

def main():
    print("\n" + "="*60)
    print("  📊 TAVERNA PERFORMANCE REPORT")
    print("  $(date '+%Y-%m-%d %H:%M:%S')")
    print("="*60 + "\n")

    # Only test a representative sample of bridges if speed is needed, 
    # but for burnout we test core ones plus a few others.
    targets = [
        (13001, "SQLite"),
        (13002, "Memory"),
        (13003, "Filesystem"),
        (13004, "Fetch"),
        (13017, "n8n"),
    ]

    global_stats = {}

    for port, name in targets:
        stats = benchmark_bridge(port, name)
        if stats:
            global_stats[name] = stats
            print(f"    ✅ Latency Stats:")
            print(f"       Avg: {stats['mean']:.2f}ms | Med: {stats['median']:.2f}ms")
            print(f"       Std: {stats['stdev']:.2f}ms | P99: {stats['p99']:.2f}ms")
            print(f"       Rng: {stats['min']:.2f}ms - {stats['max']:.2f}ms")
        else:
            print(f"    ❌ {name} is unreachable or failing.")
        print("-" * 60)

    # Summary section
    if global_stats:
        print("\n" + "="*60)
        print("  🏆 PERFORMANCE SUMMARY")
        print("="*60)
        
        # Check acceptance criteria: stdev < 20% of mean
        all_passed = True
        for name, stats in global_stats.items():
            stdev_percent = (stats['stdev'] / stats['mean']) * 100 if stats['mean'] > 0 else 0
            status = "PASS" if stdev_percent < 20 else "FAIL"
            if status == "FAIL": all_passed = False
            
            print(f"  {name:12} | Mean: {stats['mean']:6.2f}ms | StdDev: {stdev_percent:5.1f}% | [{status}]")

        print("="*60)
        if all_passed:
            print("  ✅ STABILITY CRITERIA MET (Mean StdDev < 20%)")
        else:
            print("  ⚠️  STABILITY CRITERIA FAILED (High Jitter Detected)")
    else:
        print("  ❌ No data collected. Is the system running?")

if __name__ == "__main__":
    main()
