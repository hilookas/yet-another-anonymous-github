import { NextRequest, NextResponse } from 'next/server';
import { validateRepository } from '@/lib/github';
import { encryptConfig, GitHubConfig } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo, branch, anonymizeTerms } = body;

    // Validate input
    if (!repo || !branch) {
      return NextResponse.json(
        { error: 'Repository and branch are required' },
        { status: 400 }
      );
    }

    // Validate repository
    const validationResult = await validateRepository(repo.trim(), branch.trim());
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: validationResult.error || 'Repository validation failed',
          valid: false 
        },
        { status: 400 }
      );
    }

    // Process anonymization terms
    const terms = Array.isArray(anonymizeTerms) 
      ? anonymizeTerms 
      : (typeof anonymizeTerms === 'string' 
          ? anonymizeTerms.split('\n').map(term => term.trim()).filter(term => term.length > 0)
          : []);

    // Create configuration and encrypt
    const config: GitHubConfig = {
      type: 'gh',
      repo: repo.trim(),
      branch: branch.trim(),
      anonymizeTerms: terms
    };

    const encrypted = encryptConfig(config);

    // Return result
    return NextResponse.json({
      valid: true,
      encrypted,
      info: validationResult.info,
      warnings: []
    });

  } catch (error) {
    console.error('Error in validate-and-encrypt API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 