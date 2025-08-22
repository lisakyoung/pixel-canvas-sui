module pixel_canvas::factory {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string::String;
    use pixel_canvas::canvas;
    use pixel_canvas::errors;
    use pixel_canvas::events;
    
    const CREATE_FEE: u64 = 100_000_000; // 0.1 SUI
    const SEED_MAX: u32 = 10;
    
    struct Factory has key {
        id: UID,
        treasury: address,
        total_canvases: u64,
    }
    
    struct SeedPixel has drop {
        x: u32,
        y: u32,
        color: u32,
    }
    
    fun init(ctx: &mut TxContext) {
        transfer::share_object(Factory {
            id: object::new(ctx),
            treasury: tx_context::sender(ctx),
            total_canvases: 0,
        });
    }
    
    public entry fun create_canvas(
        factory: &mut Factory,
        title: String,
        fee: Coin<SUI>,
        seeds: vector<SeedPixel>,
        ctx: &mut TxContext
    ) {
        // Verify fee
        assert!(coin::value(&fee) == CREATE_FEE, errors::invalid_fee());
        
        // Verify seed count
        let seed_count = vector::length(&seeds);
        assert!(seed_count <= (SEED_MAX as u64), errors::seed_limit_exceeded());
        
        // Validate seeds are unique and in bounds
        let seen = vector::empty<u32>();
        let i = 0;
        while (i < seed_count) {
            let seed = vector::borrow(&seeds, i);
            assert!(seed.x < 24 && seed.y < 24, errors::invalid_seed_coordinates());
            
            let idx = seed.x + seed.y * 24;
            assert!(!vector::contains(&seen, &idx), errors::duplicate_seed_pixel());
            vector::push_back(&mut seen, idx);
            i = i + 1;
        };
        
        // Transfer fee to treasury
        transfer::public_transfer(fee, factory.treasury);
        
        // Create canvas with seeds
        let canvas_id = canvas::create_with_seeds(title, seeds, ctx);
        
        factory.total_canvases = factory.total_canvases + 1;
        
        events::emit_canvas_created(
            canvas_id,
            tx_context::sender(ctx),
            title,
            (seed_count as u32)
        );
    }
}